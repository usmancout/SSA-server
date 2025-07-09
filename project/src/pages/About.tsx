import React from 'react';
import { BarChart3, Target, Users, Zap, Award, TrendingUp, Shield, Globe } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'AI-Powered Intelligence',
      description: 'Advanced machine learning algorithms analyze millions of products to deliver personalized recommendations.'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Real-Time Price Tracking',
      description: 'Monitor price changes across multiple stores and get instant alerts when your favorite items go on sale.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security. We never share your personal information.'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Marketplace',
      description: 'Access products from thousands of stores worldwide, all in one convenient platform.'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Former VP of Product at Amazon, passionate about revolutionizing e-commerce through AI.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Ex-Google engineer with 10+ years in machine learning and distributed systems.'
    },
    {
      name: 'Emily Johnson',
      role: 'Head of AI',
      image: 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'PhD in Computer Science from Stanford, specializing in recommendation systems.'
    },
    {
      name: 'David Kim',
      role: 'Head of Design',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Award-winning designer with experience at Apple and Airbnb, focused on user experience.'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '2M+' },
    { label: 'Partner Stores', value: '10K+' },
    { label: 'Products Tracked', value: '50M+' },
    { label: 'Money Saved', value: '$100M+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Revolutionizing
            </span>
            <br />
            <span className="text-white">Smart Shopping</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            ShopSenseAI combines artificial intelligence with comprehensive marketplace data to help you discover the best products at the best prices, saving you time and money on every purchase.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                We believe shopping should be intelligent, efficient, and enjoyable. Our mission is to empower consumers with AI-driven insights that transform how they discover and purchase products online.
              </p>
              <p className="text-gray-400 leading-relaxed">
                By aggregating data from thousands of stores and applying advanced machine learning algorithms, we help millions of users make informed purchasing decisions while saving both time and money.
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6">Why We Started ShopSenseAI</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 w-2 h-2 rounded-full mt-2"></div>
                  <p className="text-gray-300">Online shopping was becoming overwhelming with too many choices</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-500 w-2 h-2 rounded-full mt-2"></div>
                  <p className="text-gray-300">Price comparison across stores was time-consuming and inefficient</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500 w-2 h-2 rounded-full mt-2"></div>
                  <p className="text-gray-300">Consumers needed personalized recommendations based on their preferences</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-red-500 w-2 h-2 rounded-full mt-2"></div>
                  <p className="text-gray-300">AI technology could solve these problems at scale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our cutting-edge technology and user-centric approach set us apart in the e-commerce intelligence space.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-xl text-center group hover:bg-gray-750 transition-all duration-300">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-gray-400 text-lg">Numbers that showcase our commitment to helping shoppers worldwide</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-purple-400" />
              <h2 className="text-3xl font-bold">Meet Our Team</h2>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our diverse team of experts combines deep technical knowledge with a passion for improving the shopping experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 text-center group hover:bg-gray-750 transition-all duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-purple-400 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-2xl p-8 lg:p-12 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Zap className="h-8 w-8 text-yellow-400" />
              <h2 className="text-3xl font-bold">Our Vision for the Future</h2>
            </div>
            <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-8">
              We envision a world where every shopping decision is informed, efficient, and personalized. Through continuous innovation in AI and machine learning, we're building the future of intelligent commerce.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Award className="h-8 w-8 text-yellow-400 mb-3" />
                <h3 className="font-semibold mb-2">Industry Leadership</h3>
                <p className="text-gray-300 text-sm">Setting new standards for AI-powered shopping intelligence and user experience.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Globe className="h-8 w-8 text-blue-400 mb-3" />
                <h3 className="font-semibold mb-2">Global Expansion</h3>
                <p className="text-gray-300 text-sm">Bringing smart shopping solutions to consumers worldwide across all major markets.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Zap className="h-8 w-8 text-green-400 mb-3" />
                <h3 className="font-semibold mb-2">Innovation Focus</h3>
                <p className="text-gray-300 text-sm">Continuously advancing our AI capabilities to deliver even more personalized experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Smart Shopping Revolution</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Experience the future of online shopping with personalized recommendations, real-time price tracking, and intelligent product discovery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-semibold transition-colors">
              Get Started Free
            </button>
            <button className="border border-gray-600 hover:border-purple-500 px-8 py-3 rounded-full font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;