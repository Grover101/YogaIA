import { Navigation } from './components/Navigation'
import './styles/App.css'

const App = () => {
    return (
        <>
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className={
                        'pointer-events-none bg-black fixed inset-0 -z-50 bg-[length:100%_175%]'
                    }
                >
                    <div className="starfield absolute inset-0" />
                </div>
            </div>
            <div className="flex flex-col xl:flex-row justify-between m-auto xl:gap-x-24 xl:w-[1200px] mt-24 md:mt-10 xl:mt-0">
                <div className="w-full xl:w-52">
                    <Navigation />
                </div>
                <main className="flex-1 relative px-6">
                    <slot />
                </main>
            </div>
        </>
    )
}

export default App
