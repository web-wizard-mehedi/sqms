import { Link } from 'react-router-dom';
import Chart from './Chart';
import Credit from './Credit';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, logout } = useAuth(); // Get user and logout

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-teal-50">
      {/* Navbar */}
      <header className="flex justify-between items-center p-6 shadow-md bg-white">
        <h1 className="text-2xl font-bold text-teal-600">Queue Management System</h1>
        <div className="space-x-4">
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="px-4 py-2 bg-white text-teal-600 border border-teal-500 rounded-lg hover:bg-teal-100 transition">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
          Smart Queue Management
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Streamlining Your Service Experience
        </p>
        <div className="space-x-4">
          <Link to="/QueueBooking">
            <button className="px-6 py-3 bg-teal-500 text-white text-lg rounded-lg hover:bg-teal-600 transition">
              Book a Queue
            </button>
          </Link>
          <Link to={user && user.role === 'admin' ? '/admin' : '/dashboard'}>
            <button className="px-6 py-3 bg-white text-teal-600 border border-teal-500 text-lg rounded-lg hover:bg-teal-100 transition">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-teal-500 mb-4 text-5xl">📋</div>
            <h3 className="text-xl font-semibold mb-2">Easy Queue Booking</h3>
            <p className="text-gray-600">Book your spot effortlessly without standing in long lines.</p>
          </div>
          <div className="text-center">
            <div className="text-teal-500 mb-4 text-5xl">⏱️</div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-gray-600">Monitor your position and queue updates live, anytime.</p>
          </div>
          <div className="text-center">
            <div className="text-teal-500 mb-4 text-5xl">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Admin Control</h3>
            <p className="text-gray-600">Admins manage queues efficiently with powerful tools.</p>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-12 bg-teal-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-teal-600 mb-8">
            System Analytics
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Stats */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-2xl font-bold text-gray-800">10,542+</h3>
                <p className="text-gray-600 mt-2">Queues Served</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-2xl font-bold text-gray-800">3 mins</h3>
                <p className="text-gray-600 mt-2">Average Waiting Time</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-2xl font-bold text-gray-800">12 PM - 2 PM</h3>
                <p className="text-gray-600 mt-2">Peak Service Hours</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <Chart />
            </div>
          </div>
        </div>
      </section>


    {/* Credit Section */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center text-teal-700 mb-8">Credits</h2>
        <Credit
          mentorName="Md. Khalid Sakib"
          mentorImage="https://i.ibb.co/XZ4WdWbm/Screenshot-1.png"
          studentName="Mehedi Hasan"
          studentImage="https://scontent.fdac14-1.fna.fbcdn.net/v/t39.30808-6/473574188_1360886041830066_8392653844375538079_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=q7Uk31h5iEgQ7kNvwE1AfYN&_nc_oc=AdmBCivcHGygO54sgMzuP8gXyBv5yb_5iw5d6u1VVEQhSolAuE5KC7pNokA0dGfnkPU&_nc_zt=23&_nc_ht=scontent.fdac14-1.fna&_nc_gid=OyX28t9xwAhgglFvKdupSA&oh=00_AfOmXWQ1_mVdcphOwWsITE_4qFuXLvjkRQNAwcK2WTI2GA&oe=685DF0D7"
        />
      </div>



      {/* Decorative SVG Wave */}
      <div className="mt-auto">
        <svg viewBox="0 0 1440 320" className="w-full">
          <path
            fill="#14b8a6"
            fillOpacity="0.2"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,160C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96V320H0Z"
          ></path>
        </svg>
      </div>







      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6 bg-white">
        &copy; {new Date().getFullYear()} Queue Management System. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
