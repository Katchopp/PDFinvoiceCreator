import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  try {
    const data = req.body;
    const isDev = !process.env.AWS_REGION; // Render ≠ AWS = production

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: isDev
        ? undefined
        : await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body { font-family: sans-serif; padding: 20px; }
      .header { text-align: center; }
      .title { font-weight: bold; font-size: 20px; margin-top: 10px; }
      .section-title { font-weight: bold; margin-top: 10px; }
      .red { color: red; }
    </style></head><body>
      <div class="header">
        <img src="https://${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" style="max-width:200px;" />
        <div>Gold Tile Inc. | (857) 417-1357 | gold.tile@outlook.com</div>
        <div>12 Kendall Ave #9, Framingham, MA 01702</div>
        <div class="title">Work Order / Pricing Agreement</div>
        <div>Customer / Project: ${data.customer || 'N/A'}</div>
      </div>

      ${data.rooms?.map(room => `
        <div class="section-title">${room}:</div>
        <ul>${(data.services?.[room] || []).map(s => `<li>${s}</li>`).join('')}</ul>
      `).join('')}

      <div class="section-title">Total: $${data.price || '0.00'}</div>
      <p>${data.description || ''}</p>

      <div class="section-title">Certificate of Agreement</div>
      <p>I hereby certify I will supply all the material for this project. I hereby acknowledge this satisfactory completion of the described work and agree with the total price. I am aware that any change in the work order might affect the total price.</p>

      <div class="red">
        <ul>
          <li>50% deposit upon order placement to begin the project.</li>
          <li>25% payment upon completion of preparation work.</li>
          <li>Remaining 25% balance upon final project completion.</li>
        </ul>
      </div>
    </body></html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=workorder.pdf');
    res.send(pdf);
  } catch (err) {
    console.error('[PDF GENERATION ERROR]', err);
    res.status(500).send('Internal Server Error');
  }
};

export default handler;
