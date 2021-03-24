import React from 'react'

const I18nContext = React.createContext( [] )
I18nContext.displayName = 'i18n-texts'
export const I18nProvider = I18nContext.Provider
export default I18nContext
