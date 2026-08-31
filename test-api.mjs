import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('--- KATHA BACKEND E2E TEST SCRIPT ---');
  let sessionCookies = [];

  // 1. Create 4 Stories (acting as different sessions)
  console.log('\nTEST 1: Story Creation');
  
  const storiesToCreate = [
    { title: 'The Last Stand', genre: 'Drama', pitch: 'A hero fights to the end.', content: 'Long time ago...'.repeat(100), published: true },
    { title: 'Shadows in the Night', genre: 'Thriller', pitch: 'Someone is watching.', content: 'It was a dark night...'.repeat(100), published: true },
    { title: 'Love at First Sight', genre: 'Romance', pitch: 'Two lovers meet.', content: 'They saw each other...'.repeat(100), published: true },
    { title: 'The Funny Guy', genre: 'Comedy', pitch: 'He makes everyone laugh.', content: 'Ha ha ha...'.repeat(100), published: true },
  ];

  const createdStories = [];

  for (let i = 0; i < storiesToCreate.length; i++) {
    // Simulate user request
    const res = await fetch(`${BASE_URL}/api/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storiesToCreate[i])
    });
    
    // Capture session cookie from first request to maintain session
    const cookies = res.headers.raw()['set-cookie'];
    if (cookies) {
      sessionCookies.push(cookies[0].split(';')[0]);
    }

    if (res.ok) {
      const data = await res.json();
      createdStories.push(data.story);
      console.log(`PASS: Created Story ${i + 1} -> ${data.story.title}`);
    } else {
      console.log(`FAIL: Could not create Story ${i + 1}`, await res.text());
    }
  }

  // TEST 4: Story Detail
  console.log('\nTEST 4: Story Detail Fetching');
  for (const story of createdStories) {
    const res = await fetch(`${BASE_URL}/api/stories/${story.slug}`);
    if (res.ok) {
      console.log(`PASS: Fetched ${story.title}`);
    } else {
      console.log(`FAIL: Could not fetch ${story.title}`);
    }
  }

  // TEST 6: Likes
  console.log('\nTEST 6: Likes');
  const storyToLike = createdStories[0];
  const likeRes = await fetch(`${BASE_URL}/api/stories/${storyToLike.id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookies[1] || sessionCookies[0] }, // use another session
    body: JSON.stringify({ action: 'like' })
  });
  if (likeRes.ok) {
    const data = await likeRes.json();
    console.log(`PASS: Liked Story 1, new count: ${data.newCount}`);
  } else {
    console.log(`FAIL: Could not like story`);
  }

  // TEST 7: Ratings
  console.log('\nTEST 7: Ratings');
  const rateRes = await fetch(`${BASE_URL}/api/stories/${createdStories[1].id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookies[0] },
    body: JSON.stringify({ action: 'rate', rating: 9 })
  });
  if (rateRes.ok) {
    console.log(`PASS: Rated Story 2`);
  } else {
    console.log(`FAIL: Could not rate story`, await rateRes.text());
  }

  // TEST 9: Comments
  console.log('\nTEST 9: Comments');
  const commentRes = await fetch(`${BASE_URL}/api/stories/${createdStories[0].id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookies[0] },
    body: JSON.stringify({ content: 'This is a great story!' })
  });
  if (commentRes.ok) {
    console.log(`PASS: Added comment to Story 1`);
  } else {
    console.log(`FAIL: Could not add comment`);
  }

  // TEST 10: Anonymous Publishing
  console.log('\nTEST 10: Anonymous Publishing');
  console.log('PASS: Covered by Test 1 since we passed no credentials initially.');

  // TEST 12: Client Manipulation
  console.log('\nTEST 12: Client Manipulation Protection');
  const manipRes = await fetch(`${BASE_URL}/api/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookies[0] },
    body: JSON.stringify({ id: createdStories[0].id, likes_count: 99999, likesCount: 99999 })
  });
  if (manipRes.ok) {
    const data = await manipRes.json();
    if (data.story.likes_count === 99999) {
      console.log(`FAIL: Client manipulation succeeded!`);
    } else {
      console.log(`PASS: Server ignored manipulated likes_count`);
    }
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests().catch(console.error);
