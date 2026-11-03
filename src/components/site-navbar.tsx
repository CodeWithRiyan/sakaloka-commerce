'use client';

import Image from 'next/image';
import Link from 'next/link';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

// The storefront pages behind these links are built in R2.
const links = [
  { href: '/products', label: 'Products' },
  { href: '/fabrics', label: 'Fabrics' },
  { href: '/house-designs', label: 'House designs' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/size-guide', label: 'Size guide' },
  { href: '/stock', label: 'Stock' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function SiteNavbar() {
  return (
    <Navbar expand="lg" bg="white" sticky="top" className="border-bottom">
      <Container>
        <Navbar.Brand as={Link} href="/">
          <Image src="/brand/logo.png" alt="i2i custom" width={134} height={50} priority />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="site-nav" />
        <Navbar.Collapse id="site-nav">
          <Nav className="ms-auto">
            {links.map((link) => (
              <Nav.Link key={link.href} as={Link} href={link.href} prefetch={false}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
