import { Component } from 'react';
import { Warning } from '@phosphor-icons/react';
import Button from './ui/Button';

/**
 * Catches render-time crashes so a single broken page doesn't blank the app.
 * Class component by necessity — React exposes no hook equivalent.
 */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Warning aria-hidden="true" weight="duotone" size={32} />
        </div>
        <h1 className="mb-2 text-2xl font-black tracking-tight text-navy-900">
          Something went wrong
        </h1>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-600">
          This page hit an unexpected error. Nothing you&rsquo;ve saved is lost — try again,
          or head back to the homepage.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={this.handleReset}>Try again</Button>
          <Button to="/" variant="secondary">Back to home</Button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
