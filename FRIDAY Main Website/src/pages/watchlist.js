import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

function Watchlist() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&outputsize=full&apikey=demo');
        const data = await res.json();
        
        // Extract the stock data from the response
        const stockData = data['Time Series (5min)'];

        // Map the stock data to an array of objects with the necessary information
        const stocksArray = Object.entries(stockData).map(([key, value]) => ({
            id: key,
            name: 'IBM',
            description: `Open: ${value['1. open']}, High: ${value['2. high']}, Low: ${value['3. low']}, Close: ${value['4. close']}, Volume: ${value['5. volume']}`
        }));

        setStocks(stocksArray);
      } catch (err) {
        console.error(err);
      }
    }
    
    fetchStocks();
  }, [])

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <Head>
        <title>Stock Watchlist</title>
        <meta name="description" content="Stock Watchlist" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <h1 className="text-3xl font-bold mb-4">Stock Watchlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <Link key={stock.id} href={`/newsfeed/${stock.id}`} passHref>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 overflow-hidden">
              <div className="relative h-32 md:h-40 lg:h-48">
                <Image
                  src={stock.image}
                  alt={stock.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{stock.name}</h2>
                <p className="text-gray-600 text-sm">{stock.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Watchlist;
