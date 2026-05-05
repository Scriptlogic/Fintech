/**
 * aiService.js
 *
 * Wraps the Google Gemini API to generate financial insights.
 * Returns null (not throws) when the API is unavailable or the key is missing,
 * so the caller can fall back to rule-based insights gracefully.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n ?? 0);

/**
 * Build a concise, token-efficient prompt from the spending summary.
 * Keeping it short reduces latency and cost.
 *
 * @param {object} data  Aggregated spending data
 * @returns {string}     Prompt string
 */
const buildPrompt = (data) => {
  const {
    curLabel, lstLabel,
    curIncome, curExpense, curBalance, savingsRate,
    lstIncome, lstExpense,
    topCategories,
    frequentCategory,
  } = data;

  const categoryLines = topCategories
    .slice(0, 5)
    .map(c => `  - ${c._id}: ${formatINR(c.total)} (${c.count} transactions)`)
    .join('\n');

  return `You are a friendly personal finance advisor. Analyze this spending data and give exactly 3 short, practical financial insights in simple language. Each insight must be 1–2 sentences max. Be direct and helpful, not generic.

SPENDING DATA (${curLabel}):
- Income: ${formatINR(curIncome)}
- Expenses: ${formatINR(curExpense)}
- Savings: ${formatINR(curBalance)} (${savingsRate}% of income)
- Last month expenses: ${formatINR(lstExpense)}
- Last month income: ${formatINR(lstIncome)}

Top expense categories this month:
${categoryLines || '  - No expense data'}
${frequentCategory ? `\nMost frequent category (last 30 days): ${frequentCategory._id} (${frequentCategory.count} transactions)` : ''}

Return ONLY a JSON array of exactly 3 objects. No markdown, no explanation, just the JSON.
Each object must have these exact fields:
- "type": one of "positive", "negative", "warning", "info"
- "icon": one relevant emoji (💡 for general, 📈 for growth/increase, ⚠️ for warning, 🌟 for great, 📉 for decrease)
- "title": 3–5 words max
- "message": 1–2 sentences, friendly and specific with actual numbers

Example format:
[{"type":"positive","icon":"🌟","title":"Great savings rate","message":"You saved 34% of your income this month. Keep it up!"},...]`;
};

/**
 * Parse the AI response — handles both clean JSON and markdown-wrapped JSON.
 * Returns null if parsing fails.
 *
 * @param {string} text  Raw text from Gemini
 * @returns {Array|null}
 */
const parseAIResponse = (text) => {
  try {
    // Strip markdown code fences if present
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) return null;

    // Validate and sanitise each insight
    const VALID_TYPES = ['positive', 'negative', 'warning', 'info', 'neutral'];
    return parsed
      .filter(item => item && typeof item === 'object')
      .map((item, i) => ({
        type:     VALID_TYPES.includes(item.type) ? item.type : 'info',
        icon:     typeof item.icon    === 'string' ? item.icon.trim()    : '💡',
        title:    typeof item.title   === 'string' ? item.title.trim()   : 'Insight',
        message:  typeof item.message === 'string' ? item.message.trim() : '',
        priority: i + 1,
        value:    0,
        source:   'ai',
      }))
      .filter(item => item.message.length > 0)
      .slice(0, 5); // never return more than 5
  } catch {
    return null;
  }
};

/**
 * Generate AI insights using Gemini.
 *
 * @param {object} spendingData  Aggregated data from MongoDB
 * @returns {Promise<Array|null>}  Array of insight objects, or null on failure
 */
const generateAIInsights = async (spendingData) => {
  const apiKey = process.env.GEMINI_API_KEY;

  // No key configured — skip silently
  if (!apiKey || apiKey.trim() === '') {
    console.log('[aiService] GEMINI_API_KEY not set — using rule-based insights');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',   // fast + free tier
      generationConfig: {
        temperature:     0.4,      // low = more consistent, factual
        maxOutputTokens: 512,      // insights are short
        topP:            0.8,
      },
    });

    const prompt = buildPrompt(spendingData);

    // 8-second timeout — don't block the response for too long
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), 8000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    const text = result.response.text();
    const insights = parseAIResponse(text);

    if (!insights || insights.length === 0) {
      console.warn('[aiService] AI returned unparseable response — falling back');
      return null;
    }

    console.log(`[aiService] ✅ Generated ${insights.length} AI insights`);
    return insights;

  } catch (err) {
    // Log but don't throw — caller will use rule-based fallback
    console.warn('[aiService] AI generation failed:', err.message);
    return null;
  }
};

module.exports = { generateAIInsights };
