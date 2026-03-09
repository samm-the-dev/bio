import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface FeedCardButtonProps {
  as?: 'button';
  onClick: () => void;
  children: ReactNode;
}

interface FeedCardLinkProps {
  as: 'link';
  to: string;
  children: ReactNode;
}

type FeedCardProps = FeedCardButtonProps | FeedCardLinkProps;

export function FeedCard(props: FeedCardProps) {
  const inner =
    props.as === 'link' ? (
      <Link to={props.to} className="block">
        {props.children}
      </Link>
    ) : (
      <button type="button" onClick={props.onClick} className="block w-full text-left">
        {props.children}
      </button>
    );

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/40">
      {inner}
    </div>
  );
}
