import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Brain, MessageSquare, Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Intelligent tutors that adapt to your learning style and pace',
    },
    {
      icon: MessageSquare,
      title: 'Interactive Conversations',
      description: 'Engage in natural dialogue with AI tutors for personalized assistance',
    },
    {
      icon: Zap,
      title: 'Real-Time Feedback',
      description: 'Get instant explanations and corrections to boost your understanding',
    },
    {
      icon: Users,
      title: 'Multiple Tutors',
      description: 'Access diverse virtual tutors specialized in different subjects',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and insights',
    },
    {
      icon: CheckCircle,
      title: 'Always Available',
      description: '24/7 access to your personal tutors, anytime, anywhere',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds with your email to get started',
    },
    {
      number: '02',
      title: 'Choose Your Tutor',
      description: 'Select from our diverse collection of AI tutors',
    },
    {
      number: '03',
      title: 'Start Learning',
      description: 'Begin your interactive learning sessions immediately',
    },
    {
      number: '04',
      title: 'Track Progress',
      description: 'Monitor your improvements and achievements over time',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">VT</span>
              </div>
              <span className="hidden sm:inline font-bold text-lg sm:text-xl text-gray-900">Virtual Tutor AI</span>
            </div>

            {/* Menu Items */}
            <div className="hidden md:flex gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition font-medium">
                {t('pages.landing.features')}
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition font-medium">
                {t('pages.landing.how_it_works')}
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition font-medium">
                {t('pages.landing.about')}
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2 sm:gap-4 items-center">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/login')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                {t('pages.landing.login')}
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                {t('pages.landing.get_started')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-blue-700 text-sm font-semibold">🎓 Welcome to the Future of Learning</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn From Your Personal <span className="text-blue-600">AI Tutors</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Experience personalized, interactive learning with AI tutors available 24/7. Master any subject at your own pace with real-time feedback and adaptive learning.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center justify-center gap-2 px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Get Started Free <ArrowRight size={20} />
                </button>
                <button className="px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 transition">
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center lg:justify-start text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">10K+</p>
                  <p className="text-gray-600 text-sm sm:text-base">Active Learners</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">50+</p>
                  <p className="text-gray-600 text-sm sm:text-base">AI Tutors</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">95%</p>
                  <p className="text-gray-600 text-sm sm:text-base">Satisfaction Rate</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Animated gradient box */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl opacity-10 blur-2xl animate-pulse"></div>
                
                {/* Main illustration box */}
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 shadow-lg">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Brain className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Smart Learning</p>
                        <p className="text-sm text-gray-600">AI adapts to your pace</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Interactive Chats</p>
                        <p className="text-sm text-gray-600">Real conversations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Track Progress</p>
                        <p className="text-sm text-gray-600">See your improvements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Better Learning
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to accelerate your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:scale-105 transition duration-300"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="text-blue-600" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 left-1/2 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent -translate-y-1/2"></div>
                )}

                <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 hover:border-blue-600 transition relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-bold text-lg rounded-full mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of students already learning with Virtual Tutor AI. Start your free journey today.
          </p>

          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition"
          >
            Get Started Now <ArrowRight size={20} />
          </button>

          <p className="mt-6 text-blue-100 text-sm sm:text-base">
            No credit card required • Free to join • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">VT</span>
                </div>
                <span className="font-bold text-white">Virtual Tutor AI</span>
              </div>
              <p className="text-sm">Transforming education through AI-powered personalized learning.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Virtual Tutor AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
