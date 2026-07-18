import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  /** Any value that identifies the current module. Changing it resets the boundary. */
  resetKey?: string | number;
  moduleLabel?: string;
  onRecover?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Isolates a single module. If it crashes, only this area shows an error
 * message — the rest of the app (sidebar, header, other modules) stays
 * usable. The boundary automatically resets when `resetKey` changes so
 * navigating to another module always renders fresh content.
 */
class ModuleErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ModuleErrorBoundary] module crashed:', error, info);
  }

  public componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleReset = () => {
    this.props.onRecover?.();
    this.setState({ hasError: false, error: null });
  };

  private handleReloadModule = () => {
    this.props.onRecover?.();
    window.dispatchEvent(new CustomEvent('aqua:data-refresh', { detail: { reason: 'module-error-boundary' } }));
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Card className="border-destructive/40 bg-destructive/5 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Ce module a rencontré une erreur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Les autres modules restent accessibles depuis le menu latéral. Vous pouvez réessayer sans recharger l'application.
              </p>
              {this.state.error && (
                <div className="text-xs bg-muted p-3 rounded-md font-mono overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={this.handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button size="sm" variant="outline" onClick={this.handleReloadModule}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recharger le module
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ModuleErrorBoundary;