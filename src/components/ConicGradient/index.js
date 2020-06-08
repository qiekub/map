import React, { useState, useEffect, useRef, useCallback } from 'react'

function useInterval(callback, delay) {
	// source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

function useConicGradient() {
	const waitingForConicGradient = useRef([])
	const [isRunning, setIsRunning] = useState(false)
	const [conicGradientExists, setConicGradientExists] = useState(false)

	const onReady = useCallback(function(callback){
		if (!!callback) {
			if (conicGradientExists) {
				callback()
			}else{
				waitingForConicGradient.current.push(callback)
			}
		}
	}, [conicGradientExists])

	const getConicGradient = useCallback(function(){
		if (conicGradientExists) {
			return window.ConicGradient
		}else{
			return null
		}
	}, [conicGradientExists])

	useEffect(function(){
		setIsRunning(true)
	}, [])

	useInterval(function(){
		if (!!window.ConicGradient) {
			setIsRunning(false)
			setConicGradientExists(true)

			for (const callback of waitingForConicGradient.current) {
				callback()
			}
			waitingForConicGradient.current = []
		}
	}, isRunning ? 10 : null)

	return {
		onReady,
		getConicGradient,
	}
}

function withConicGradient(Component) {	
	return React.forwardRef(function(props, ref){
		const ConicGradientProps = useConicGradient()
		return <Component conic_gradient={ConicGradientProps} ref={ref} {...props} />
	})
}

export { withConicGradient }


