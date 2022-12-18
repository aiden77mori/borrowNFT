import { useState, useEffect, useLayoutEffect } from 'react';

function useDimension(targetRef) {
  const getDimensions = () => {
    return {
      width: targetRef.current ? (targetRef.current.clientWidth >= 1024 ? targetRef.current.naturalWidth : targetRef.current.offsetWidth)  : 0,
      height: targetRef.current ? (targetRef.current.clientWidth >= 1024 ? targetRef.current.naturalHeight : targetRef.current.offsetHeight) : 0
    };
  };

  const [dimensions, setDimensions] = useState(getDimensions);

  const handleResize = () => {
    setDimensions(getDimensions());
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    handleResize();
  }, []);
  return dimensions;
}

export default useDimension