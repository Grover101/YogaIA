import React, { useState } from 'react'
import { Icons } from './Icons'
import { LinkRoute } from './Link'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const NAVIGATION_LINKS = [
    {
        title: 'Home',
        to: '/'
    },
    {
        title: 'About',
        to: '/about'
    },
    {
        title: 'Evaluate',
        to: '/evaluate'
    }
]

const SOCIAL_NETWORKS_LINKS = [
    {
        component: Icons.facebook,
        title: 'facebook',
        icon: 'facebook-icon.svg',
        href: '#'
    },
    {
        component: Icons.linkedin,
        title: 'linkedin',
        icon: 'linkedin-icon.svg',
        href: '#'
    },
    {
        component: Icons.twitter,
        title: 'twitter',
        icon: 'twitter-icon.svg',
        href: '#'
    }
]

export const Navigation = () => {
    const [open, setOpen] = useState(true)
    const navigate = useNavigate()

    return (
        <aside className="flex flex:row items-center justify-between xl:justify-center text-primary px-4 xl:pb-20 xl:sticky xl:flex-col h-full">
            <Link to="/" className="w-full h-full xl:h-auto py-6">
                <Icons.logo
                    width={200}
                    height={50}
                    className={`xl:w-32 w-72 lg:w-80  mx-auto animate-zoomIn cursor-pointer duration-500 ${
                        open && 'rotate-[360deg]'
                    }`}
                    onClick={() => setOpen(!open)}
                />
            </Link>

            <nav className="min-h-screen last fixed top-0 left-0 pointer-events-none opacity-0 peer-checked:opacity-100 peer-checked:pointer-events-auto right-0 z-40 flex py-12 px-8  backdrop-blur-lg text-center xl:opacity-100 xl:pointer-events-auto xl:min-h-0 xl:relative xl:px-0 justify-center flex-col xl:backdrop-blur-0 xl:mt-1 transition-opacity xl:transition-all">
                <ul className="flex flex-col gap-y-8 mb-20">
                    {NAVIGATION_LINKS.map(({ disabled, title, to }) => {
                        return (
                            <li key={`rute-${title}`}>
                                <LinkRoute
                                    disabled={disabled}
                                    to={`${to}`}
                                    title={title}
                                />
                            </li>
                        )
                    })}
                    {localStorage.getItem('login') === 'true' ? (
                        <li key={`rute-logout`}>
                            <a
                                className="group relative py-3 leading-tight font-extrabold transition hover:text-orangeColor text-2xl"
                                href="#"
                                onClick={() => {
                                    localStorage.clear()
                                    navigate('/')
                                    toast.success('Logout Success')
                                }}
                            >
                                <span>Logout</span>
                            </a>
                        </li>
                    ) : null}
                </ul>

                <div className="flex flex-row items-center justify-center gap-4 py-2">
                    {SOCIAL_NETWORKS_LINKS.map(
                        ({ component: Icon, href, title }) => {
                            return (
                                <a
                                    key={`red-${title}`}
                                    className="text-white hover:scale-125 transition-all hover:text-primary"
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span aria-label={title}>
                                        <Icon />
                                    </span>
                                </a>
                            )
                        }
                    )}
                </div>
            </nav>
        </aside>
    )
}
