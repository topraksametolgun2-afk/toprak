export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12" data-testid="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm">💻</span>
              </div>
              <span className="text-sm text-muted-foreground">TypeScript Monorepo Şablonu</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-muted-foreground">React 18 + Express.js + Supabase</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-success rounded-full"></span>
              <span className="text-xs text-success font-medium">Tüm sistemler aktif</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
