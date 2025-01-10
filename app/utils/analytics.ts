import mixpanel from 'mixpanel-browser'

// Initialize Mixpanel
mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '')

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  mixpanel.track(eventName, properties)
}

export const setUserProfile = (userId: string, properties?: Record<string, any>) => {
  mixpanel.identify(userId)
  if (properties) {
    mixpanel.people.set(properties)
  }
}

export const trackPageView = (pageName: string) => {
  mixpanel.track('Page View', { page: pageName })
}

