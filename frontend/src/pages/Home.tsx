import { FC, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaChartLine, FaDatabase, FaMobileAlt } from 'react-icons/fa';

interface Statistic {
  value: string;
  label: string;
}

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const Home: FC = () => {
  const stats: Statistic[] = [
    { value: '10K+', label: 'Active Users' },
    { value: '1M+', label: 'Data Points' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Monitoring' },
  ];

  const features: Feature[] = [
    {
      icon: <FaLeaf className="w-8 h-8 text-green-500" />,
      title: 'Real-time Monitoring',
      description: 'Track plant health metrics in real-time with advanced sensors and IoT integration.',
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-green-500" />,
      title: 'Data Analytics',
      description: 'Comprehensive analysis tools to help you make data-driven farming decisions.',
    },
    {
      icon: <FaDatabase className="w-8 h-8 text-green-500" />,
      title: 'Historical Data',
      description: 'Access and analyze historical plant health data to identify patterns and trends.',
    },
    {
      icon: <FaMobileAlt className="w-8 h-8 text-green-500" />,
      title: 'Mobile Access',
      description: 'Monitor your plants from anywhere using our responsive mobile interface.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Plant Health Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empower your farming with data-driven insights and real-time plant health monitoring
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/demo"
              className="bg-white text-green-500 border-2 border-green-500 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-green-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Features for Smart Farming
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Data Section */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-3xl font-bold mb-6">Plant Data Management</h2>
            <p className="text-gray-600 mb-6">
              Access comprehensive plant health data, including soil conditions, growth metrics, and environmental factors.
            </p>
            <Link
              to="/plant-data"
              className="inline-flex items-center text-green-500 hover:text-green-600 transition-colors"
            >
              View Plant Data
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;