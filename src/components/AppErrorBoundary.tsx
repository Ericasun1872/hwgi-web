"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Prevent a client crash from blanking the whole marketing site. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page">
          <header className="page-header">
            <h1>페이지를 불러오지 못했습니다</h1>
            <p>잠시 후 새로고침해 주세요.</p>
          </header>
          <button
            type="button"
            className="cta cta--primary"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
