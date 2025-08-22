const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => ({
  type: SET_USER,
  payload: user,
});

const removeUser = () => ({
  type: REMOVE_USER,
});

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const res = await fetch('/api/auth/', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      // if backend returns something like { errors: ... }, just treat as logged-out
      if (data && !data.errors) dispatch(setUser(data));
      else dispatch(setUser(null));
      return;
    }
    if (res.status === 401) {
      // not logged in is fine; silence the warning
      dispatch(setUser(null));
      return;
    }
    // other statuses: surface briefly, but don't crash app
    throw new Error(`Authentication failed: ${res.status}`);
  } catch (e) {
    // network / unexpected: treat as logged out
    dispatch(setUser(null));
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(setUser(data));
  } else if (res.status < 500) {
    return await res.json(); // field errors
  } else {
    return { server: 'Something went wrong. Please try again' };
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(user),
  });

  if (res.ok) {
    const data = await res.json();
    dispatch(setUser(data));
  } else if (res.status < 500) {
    return await res.json();
  } else {
    return { server: 'Something went wrong. Please try again' };
  }
};

export const thunkLogout = () => async (dispatch) => {
  await fetch('/api/auth/logout', { credentials: 'include' });
  dispatch(removeUser());
};

const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}

export default sessionReducer;
