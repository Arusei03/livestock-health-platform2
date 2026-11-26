const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-4 text-center">
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Livestock Health. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;