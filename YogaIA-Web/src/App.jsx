import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Home } from './components/secctions/Home'
import { About } from './components/secctions/About'
import { Navigation } from './components/Navigation'
import { Evaluate } from './components/secctions/Evaluate'
import './styles/App.css'
import { Profile } from './components/secctions/Profile'
import { SignUp } from './components/secctions/SignUp'
import { SignIn } from './components/secctions/SignIn'

const App = () => {
    return (
        <div className="flex">
            <Router>
                <div className="w-72 bg-slate-600 h-screen p-5  pt-8 relative duration-300">
                    <Navigation />
                </div>
                <div className="starfield w-full">
                    <div className="h-screen flex-1 p-16">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/evaluate" element={<Evaluate />} />
                            <Route path="/login" element={<SignIn />} />
                            <Route path="/register" element={<SignUp />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </div>
    )
}

export default App
