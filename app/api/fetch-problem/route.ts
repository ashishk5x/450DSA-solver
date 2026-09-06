import { NextResponse } from 'next/server';

function cleanHtml(html: string) {
  let text = html || '';
  text = text.replace(/<[^>]*>?/gm, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/\n\s*\n/g, '\n\n').trim();
  return text;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // LeetCode
    if (url.includes('leetcode.com/problems/')) {
      const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid LeetCode URL' }, { status: 400 });
      
      const slug = match[1];
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query questionData($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                title
                content
              }
            }
          `,
          variables: { titleSlug: slug }
        })
      });
      
      const data = await response.json();
      if (!data?.data?.question) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      
      const { title, content } = data.data.question;
      return NextResponse.json({ problem: `${title}\n\n${cleanHtml(content)}` });
    }
    
    // GeeksForGeeks
    if (url.includes('geeksforgeeks.org/problems/')) {
      const match = url.match(/geeksforgeeks\.org\/problems\/([^/]+)/);
      if (!match) return NextResponse.json({ error: 'Invalid GFG URL' }, { status: 400 });
      
      const slug = match[1];
      const response = await fetch(`https://practiceapi.geeksforgeeks.org/api/vr/problems/${slug}/`);
      const data = await response.json();
      
      if (!data?.results?.problem_question) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }
      
      const title = data.results.problem_name || 'GeeksForGeeks Problem';
      const content = data.results.problem_question;
      return NextResponse.json({ problem: `${title}\n\n${cleanHtml(content)}` });
    }

    return NextResponse.json({ error: 'Unsupported URL platform' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch problem' }, { status: 500 });
  }
}
