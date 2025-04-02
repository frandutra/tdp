import { Link } from 'react-router-dom';
import { LogIn, UserPlus, TrendingUp, Bell, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crypto Tracker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Monitorea tus criptomonedas favoritas, configura alertas y mantente actualizado con las últimas tendencias del mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link to="/login" className="flex-1">
              <button className="w-full group flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <LogIn size={20} className="transition-transform group-hover:-translate-y-px" />
                Iniciar Sesión
              </button>
            </Link>
            
            <Link to="/register" className="flex-1">
              <button className="w-full group flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-700 font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                <UserPlus size={20} className="transition-transform group-hover:-translate-y-px" />
                Registrarse
              </button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            title="Seguimiento en Tiempo Real"
            description="Mantén un registro actualizado de los precios y tendencias de tus criptomonedas favoritas."
          />
          
          <FeatureCard 
            icon={<Bell className="w-6 h-6 text-purple-600" />}
            title="Sistema de Alertas"
            description="Configura alertas personalizadas para estar al tanto de cambios importantes en el mercado."
          />
          
          <FeatureCard 
            icon={<Star className="w-6 h-6 text-yellow-500" />}
            title="Lista de Favoritos"
            description="Guarda y organiza tus criptomonedas favoritas para un acceso rápido y sencillo."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Home;