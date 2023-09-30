import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import { Navbar, Nav, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LogoutButton, LoginButton } from "./Auth";

const Navigation = (props) => {

  return (
    <Navbar expand="sm" variant="dark" sticky="top" className="navbar-padding navbar-color">
      <Link to="/" className='link-color-secondary'>
        <Navbar.Brand>
          <i className="bi bi-archive-fill icon-size ms-5" /> CMSmall
        </Navbar.Brand>
      </Link>

      <Nav variant="pills">
        <Nav.Item>
          <Link to="/backoffice" className='link-color-secondary'>Back Office</Link>
        </Nav.Item>
        <Nav.Item>
          <Link to="/frontoffice" className='link-color-secondary ms-2'>Front Office</Link>
        </Nav.Item>
      </Nav>

      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end me-5">
        <Nav className="ml-md-auto">
          <Navbar.Text className="mx-2">
            {props.user && props.user.username && `Welcome, ${props.user.username}!`}
          </Navbar.Text>
          <Form className="mx-2">
            {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
          </Form>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export { Navigation };
