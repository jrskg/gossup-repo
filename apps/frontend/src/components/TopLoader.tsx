import NProgress from 'nprogress';
import { useEffect } from 'react';
import 'nprogress/nprogress.css';

const TopLoader = () => {
  NProgress.configure({ showSpinner: false,  });
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);
  return (
    <></>
  )
}

export default TopLoader