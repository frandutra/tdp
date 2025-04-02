import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { ChevronDown, XCircle } from 'lucide-react';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  trend?: number;
  isFavorite?: boolean;
}

const Panel: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Crypto;
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });
  const [filter, setFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        const [cryptosResponse, favoritesResponse] = await Promise.all([
          axios.get("http://localhost:3001/api/cryptos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3001/api/cryptos/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const favoriteIds = new Set(favoritesResponse.data.map((fav: Crypto) => fav.id));
        const cryptosWithFavorites = cryptosResponse.data.map((crypto: Crypto) => ({
          ...crypto,
          isFavorite: favoriteIds.has(crypto.id)
        }));

        setCryptos(cryptosWithFavorites);
      } catch (error) {
        setError("Error al obtener las criptomonedas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (column: keyof Crypto) => {
    setSortConfig(prevConfig => ({
      key: column,
      direction: prevConfig.key === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const sortedAndFilteredCryptos = [...cryptos]
    .filter(crypto =>
      crypto.name.toLowerCase().includes(filter.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      return sortConfig.direction === 'asc'
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });

  const totalItems = sortedAndFilteredCryptos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedAndFilteredCryptos.slice(startIndex, endIndex);

  const addCrypto = async (id: string) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No se encontró el token de autenticación");

      const cryptoData = cryptos.find((crypto) => crypto.id === id);
      if (!cryptoData) throw new Error("Criptomoneda no encontrada");

      setAnimatingId(id);

      const newCrypto = {
        id: cryptoData.id,
        name: cryptoData.name,
        symbol: cryptoData.symbol,
        trend: cryptoData.trend,
        price: cryptoData.price,
      };

      await axios.post("http://localhost:3001/api/cryptos", newCrypto, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCryptos(prevCryptos =>
        prevCryptos.map(crypto =>
          crypto.id === id ? { ...crypto, isFavorite: true } : crypto
        )
      );

      setTimeout(() => setAnimatingId(null), 500);
    } catch {
      setError("Error al añadir la criptomoneda");
      setAnimatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Panel de Seguimiento
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={filter}
              onChange={handleFilterChange}
              placeholder="Buscar criptomoneda..."
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 transition-shadow"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
          <XCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Nombre
                  <ChevronDown size={16} className={`transform transition-transform ${
                    sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  Símbolo
                  <ChevronDown size={16} className={`transform transition-transform ${
                    sortConfig.key === 'symbol' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-1">
                  Precio (USD)
                  <ChevronDown size={16} className={`transform transition-transform ${
                    sortConfig.key === 'price' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('trend')}
              >
                <div className="flex items-center gap-1">
                  Cambio 24h (%)
                  <ChevronDown size={16} className={`transform transition-transform ${
                    sortConfig.key === 'trend' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              [...Array(itemsPerPage)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </td>
                </tr>
              ))
            ) : (
              currentItems.map((crypto) => (
                <tr key={crypto.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{crypto.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {crypto.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${crypto.price?.toFixed(2) ?? 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      crypto.trend && crypto.trend >= 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {crypto.trend?.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => !crypto.isFavorite && addCrypto(crypto.id)}
                      disabled={crypto.isFavorite}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-all duration-300
                        ${crypto.isFavorite 
                          ? 'bg-green-500 text-white cursor-default'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }
                        ${animatingId === crypto.id ? 'scale-110' : 'scale-100'}
                      `}
                    >
                      {crypto.isFavorite ? '✓ Favoritos' : 'Agregar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-colors duration-150 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Panel;