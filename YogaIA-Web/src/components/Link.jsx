import React from 'react'
import './../styles/Link.css'

export const Link = ({ classLink = '', disabled, href, isExternal, title }) => {
    const anchorProps = isExternal ? { target: '_blank', rel: 'noopener' } : {}

    return (
        <a
            className={`${classLink} ${
                disabled ? 'text-white' : 'text-primary'
            } group relative py-3 leading-tight font-extrabold text-xl transition hover:text-white xl:text-2xl`}
            href={disabled ? '#' : href}
            {...anchorProps}
        >
            <span className={disabled ? 'opacity-70' : ''}>{title}</span>
        </a>
    )
}
