export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const smsKey = process.env.SKY_SMS_API_KEY;

  if (!redisUrl || !redisToken || !smsKey) {
    return res.status(500).json({
      success: false,
      message: 'Server services are not configured'
    });
  }

  let body = req.body || {};

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request body'
    });
  }

  const { action, phone_number, code } = body;

  if (
    typeof phone_number !== 'string' ||
    !/^\+639\d{9}$/.test(phone_number)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Philippine mobile number'
    });
  }

  if (!['send', 'verify'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }

  if (
    action === 'verify' &&
    (typeof code !== 'string' || !/^\d{6}$/.test(code))
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP format'
    });
  }

  // Vercel-provided client IP header. Verify deployment behavior
  // before relying on IP-based limits as the only protection.
  const ip = String(req.headers['x-forwarded-for'] || 'unknown')
    .split(',')[0]
    .trim()
    .slice(0, 80);

  const windowSeconds = 600;

  const limits = action === 'send'
    ? [
        { key: `otp:phone:${phone_number}:send`, limit: 3 },
        { key: `otp:ip:${ip}:send`, limit: 10 },
        { key: `otp:pair:${phone_number}:${ip}:send`, limit: 3 }
      ]
    : [
        { key: `otp:phone:${phone_number}:verify`, limit: 10 },
        { key: `otp:ip:${ip}:verify`, limit: 30 },
        { key: `otp:pair:${phone_number}:${ip}:verify`, limit: 5 }
      ];

  try {
    // Atomically increment one counter and set its expiry.
    const script = [
      'local n = redis.call("INCR", KEYS[1])',
      'if n == 1 then',
      '  redis.call("EXPIRE", KEYS[1], ARGV[1])',
      'end',
      'local ttl = redis.call("TTL", KEYS[1])',
      'return {n, ttl}'
    ].join('\n');

    for (const item of limits) {
      const rateResponse = await fetch(redisUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redisToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          'EVAL',
          script,
          '1',
          item.key,
          String(windowSeconds)
        ]),
        signal: AbortSignal.timeout(8000)
      });

      if (!rateResponse.ok) {
        throw new Error('Rate limiter unavailable');
      }

      const rateData = await rateResponse.json();

      if (rateData.error || !Array.isArray(rateData.result)) {
        throw new Error('Invalid rate limiter response');
      }

      const [count, ttl] = rateData.result;

      if (!Number.isFinite(Number(count))) {
        throw new Error('Invalid rate limit count');
      }

      if (Number(count) > item.limit) {
        res.setHeader(
          'Retry-After',
          String(Math.max(1, Number(ttl) || windowSeconds))
        );

        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Try again later.'
        });
      }
    }

    let url;
    const options = {
      method: 'POST',
      headers: {
        'X-API-Key': smsKey,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    };

    if (action === 'send') {
      url = 'https://skysms.skyio.site/api/v1/otp/send';
      options.body = JSON.stringify({ phone_number });
    } else {
      url =
        'https://skysms.skyio.site/api/v1/otp/verify?' +
        new URLSearchParams({ phone_number, code }).toString();

      options.method = 'GET';
      delete options.body;
    }

    const smsResponse = await fetch(url, options);

    let smsResult;

    try {
      smsResult = await smsResponse.json();
    } catch {
      return res.status(503).json({
        success: false,
        message: 'OTP provider returned an invalid response'
      });
    }

    if (
      !smsResponse.ok ||
      !smsResult ||
      smsResult.success !== true
    ) {
      return res.status(400).json({
        success: false,
        message: 'OTP request failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP operation successful'
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: 'OTP service temporarily unavailable'
    });
  }
}
