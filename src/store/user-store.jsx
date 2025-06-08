import PropTypes from 'prop-types';
import { useMemo, useState, useContext, createContext } from 'react';

const UserStoreContext = createContext(null);

export function UserStoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserStoreContext.Provider value={value}>{children}</UserStoreContext.Provider>;
}

UserStoreProvider.propTypes = {
  children: PropTypes.node,
};

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (!context) throw new Error('useUserStore must be used within UserStoreProvider');
  return context;
}
