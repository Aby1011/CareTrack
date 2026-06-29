const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Load the HTML file
        const filePath = `file://${path.resolve(__dirname, 'schema.html')}`;
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        await page.pdf({
            path: 'CareTrack_Database_Schema_Details.pdf',
            format: 'A4',
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
            printBackground: true
        });
        
        await browser.close();
        console.log('PDF generated successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
})();
