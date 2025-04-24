import {
  useCallback,
  useMemo,
} from 'react';
import {
  useLocation,
  useHistory,
} from 'react-router-dom';

export const useIsShared = () => {
  const location = useLocation();
  const history = useHistory();

  const getIsShared = useCallback(() => {
    return new URLSearchParams(history.location.search).get('shared') === 'true';
  }, [history.location.search]);

  const isShared = useMemo(() => getIsShared(), [getIsShared]);

  const setIsShared = useCallback((_isShared) => {
    const searchParams = new URLSearchParams(location.search);

    if (_isShared) {
      searchParams.set('shared', true);
    } else {
      searchParams.delete('shared');
    }

    history.replace({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  }, [location, history]);

  return {
    isShared,
    getIsShared,
    setIsShared,
  };
};
