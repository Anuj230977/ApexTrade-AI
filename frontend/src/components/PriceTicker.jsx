import { useState } from 'react'

export default function PriceTicker() {
  const [symbol, setSymbol] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGetPrice = async () => {
    const trimmed = symbol.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(
        `http://localhost:8080/api/market/price/${encodeURIComponent(trimmed)}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch price (${response.status})`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to fetch price')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Stock symbol (e.g. AAPL)"
      />
      <button type="button" onClick={handleGetPrice} disabled={loading}>
        Get Price
      </button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {data && (
        <div>
          <p>Symbol: {data.symbol}</p>
          <p>Price: {data.price}</p>
          <p>Currency: {data.currency}</p>
        </div>
      )}
    </div>
  )
}
