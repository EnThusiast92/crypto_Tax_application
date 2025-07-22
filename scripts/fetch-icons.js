
const fs = require('fs');
const path = require('path');

const fetchIcons = async () => {
    try {
        console.log('Fetching top 300 crypto icons from CoinGecko...');
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=300&page=1&sparkline=false');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from CoinGecko API: ${response.status} ${response.statusText}`);
        }

        const coins = await response.json();

        const iconMap = {};
        coins.forEach(coin => {
            if (coin.symbol && coin.image) {
                iconMap[coin.symbol.toLowerCase()] = coin.image;
            }
        });
        
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)){
            fs.mkdirSync(publicDir);
        }

        const outputFile = path.join(publicDir, 'coingecko-icons.json');
        fs.writeFileSync(outputFile, JSON.stringify(iconMap, null, 2));

        console.log(`Successfully fetched and saved ${Object.keys(iconMap).length} icons to ${outputFile}`);
    } catch (error) {
        console.error('Error fetching crypto icons:', error.message);
        // Do not exit with error, as this might block deployment pipelines
        // Create an empty file instead.
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)){
            fs.mkdirSync(publicDir);
        }
        const outputFile = path.join(publicDir, 'coingecko-icons.json');
        if (!fs.existsSync(outputFile)) {
            fs.writeFileSync(outputFile, JSON.stringify({}, null, 2));
            console.log('Created an empty coingecko-icons.json file as a fallback.');
        }
    }
};

fetchIcons();
