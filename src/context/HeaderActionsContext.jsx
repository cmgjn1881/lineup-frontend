/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useContext } from 'react';

const HeaderActionsContext = createContext();

export const useHeaderActions = () => useContext(HeaderActionsContext);

const HeaderActionsProvider = ({ children }) => {
  const [actions, setActions] = useState(null);

  const value = { actions, setActions };

  return <HeaderActionsContext.Provider value={value}>{children}</HeaderActionsContext.Provider>;
};

export default HeaderActionsProvider;
