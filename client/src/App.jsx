import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import API from "./API";
import { LoadingLayout, NotFoundLayout, HomeLayout, LoginLayout, BackOfficeLayout, FrontOfficeLayout } from "./pages/PageLayout";
import { Container } from "react-bootstrap";
import { Navigation } from "./components/Navigation";
import dayjs from 'dayjs'
import PageCardList from "./components/PageCardList";
import { PageCardExpanded } from "./components/PageExpanded";
import { PageForm } from "./components/PageForm";

function App() {

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const [pages, setPages] = useState([]);
  const [sitename, setSitename] = useState('')

  const [message, setMessage] = useState("");
  const [errorAlert, setErrorAlert] = useState(false)


  const handleAlertClose = () => {
    setMessage("");
    setErrorAlert(false);
  }

  // If an error occurs, the error message will be shown in a ALERT.
  const handleErrors = (err) => {
    let msg = "";
    if (err.error) msg = err.error;
    else if (err.message) msg = err.message;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setMessage(msg);
    setErrorAlert(true);
  };

  useEffect(() => {
    if(errorAlert) {
      const timeout = setTimeout(() => {
        setErrorAlert(false);
      },5000);
      return () => clearTimeout(timeout)
    }
  }, [errorAlert])
  
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo(); // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true);
        setLoading(false);
      } catch (err) {
        handleErrors(err); // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false);
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const pages = await API.listPages();
        setPages(pages)
        setLoading(false);
      } catch (err) {
        handleErrors(err);
      }
    }
    fetchPages();
  }, [loggedIn])

  useEffect(() => {
    const fecthSitename = async () => {
      try {
        setLoading(true);
        const site = await API.getWebsite();
        setSitename(site.name);
        setLoading(false);
      } catch (error) {
        handleErrors(err)
      }
    }

    fecthSitename();
  }, [])

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setErrorAlert(false)
      setMessage("")
      setLoading(false);
    } catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  };

  /**
   * This function handles the logout process.
   */
  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setUser(null);
  };

  return (
    <BrowserRouter>
        <Container fluid className="App main-fluid-container">
          <Navigation logout={handleLogout} user={user} loggedIn={loggedIn} />
          <Routes>
            <Route path="/" element={loading ? (<LoadingLayout />) : (<HomeLayout handleErrors={handleErrors} errorAlert={errorAlert} message={message} handleAlertClose={handleAlertClose} />)}>
              <Route path="*" element={<NotFoundLayout />} />
            </Route>
            <Route path='backoffice' element={loggedIn ? <BackOfficeLayout handleErrors={handleErrors} errorAlert={errorAlert} message={message} handleAlertClose={handleAlertClose} user={user} pages={pages} sitename={sitename} setSitename={setSitename} /> : <Navigate replace to="/login" />} >
              <Route index element={<PageCardList title={'List of all pages.'} user={user} pages={pages} errorAlert={errorAlert} handleErrors={handleErrors} message={message} setMessage={setMessage} setErrorAlert={setErrorAlert} />} />
              <Route path="edit" element={<PageForm setLoading={setLoading} sitename={sitename} setPages={setPages} user={user} errorAlert={errorAlert} handleErrors={handleErrors} message={message} setMessage={setMessage} setErrorAlert={setErrorAlert} />} />
              <Route path="page" element={loggedIn ? <PageCardExpanded sitename={sitename} setPages={setPages} user={user} handleErrors={handleErrors} errorAlert={errorAlert} message={message} setMessage={setMessage} setErrorAlert={setErrorAlert}  /> : <Navigate replace to="/login" />} />
            </Route>

            <Route path="frontoffice" element={loading ? <LoadingLayout /> :
              <FrontOfficeLayout sitename={sitename} handleErrors={handleErrors} errorAlert={errorAlert} message={message} handleAlertClose={handleAlertClose}/>} >
              <Route index element={<PageCardList user={user} title={'Latest published pages.'} pages={pages.filter(page => dayjs(page.publicationDate).isBefore(dayjs()))} handleErrors={handleErrors} errorAlert={errorAlert} message={message} setMessage={setMessage} setErrorAlert={setErrorAlert} />} />
              <Route path="page" element={<PageCardExpanded sitename={sitename} errorAlert={errorAlert} message={message} setMessage={setMessage} setErrorAlert={setErrorAlert} handleErrors={handleErrors} />} />
            </Route>

            <Route path="/login" element={!loggedIn ? (<LoginLayout sitename={sitename}  login={handleLogin} message={message} setMessage={setMessage} handleAlertClose={handleAlertClose} handleErrors={handleErrors} />) : (<Navigate replace to="/backoffice" />)} />
          </Routes>
        </Container>
    </BrowserRouter >
  );
}

export default App;
