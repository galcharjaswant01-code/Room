const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  const allUrls = new Set();
  const searches = ['interior design', 'bedroom', 'living room', 'kitchen', 'apartment'];
  
  for (const term of searches) {
    console.log(`Searching Pexels for ${term}...`);
    await page.goto(`https://www.pexels.com/search/${encodeURIComponent(term)}/`, { waitUntil: 'domcontentloaded' });
    
    for (let i = 0; i < 3; i++) {
      const images = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.map(img => img.src).filter(src => src && src.includes('images.pexels.com/photos/'));
      });
      
      images.forEach(i => allUrls.add(i.split('?')[0]));
      console.log(`Found ${allUrls.size} unique URLs so far...`);
      if (allUrls.size >= 120) break;
      
      await page.evaluate(() => window.scrollBy(0, 2000));
      await new Promise(r => setTimeout(r, 1000));
    }
    if (allUrls.size >= 120) break;
  }
  
  fs.writeFileSync('urls.json', JSON.stringify(Array.from(allUrls)));
  console.log('Saved to urls.json');
  await browser.close();
})();
