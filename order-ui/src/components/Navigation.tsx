import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faPlus, faHome } from '@fortawesome/free-solid-svg-icons';

export const Navigation: React.FC = () => {
  return (
    <Navbar bg="light" variant="light" expand="lg" className="mb-0 navbar">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <FontAwesomeIcon icon={faClipboardList} className="me-2" />
            Order Management System
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>
                <FontAwesomeIcon icon={faHome} className="me-1" />
                Dashboard
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/create">
              <Nav.Link>
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                Create Order
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
