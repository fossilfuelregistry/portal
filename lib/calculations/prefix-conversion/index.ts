import { pipe } from "fp-ts/function";
import Graph from "graph-data-structure";
import { Store } from "lib/types";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import * as E from "fp-ts/Either";
import * as B from "fp-ts/boolean";
import * as O from "fp-ts/Option";
import notificationError from "../notification-error";

export type PrefixRecord = {
  fromPrefix: string;
  toPrefix: string;
  factor: number;
};

const prefixGraph = (rows: PrefixRecord[]) => {
  const g = Graph();
  rows.forEach(({ fromPrefix, toPrefix, factor }) => {
    if (!g.hasEdge(fromPrefix, toPrefix))
      g.addEdge(fromPrefix, toPrefix, factor);
    if (!g.hasEdge(toPrefix, fromPrefix))
      g.addEdge(toPrefix, fromPrefix, 1 / factor);
  });
  return g;
};

const getFactor =
  (graph: ReturnType<typeof Graph>) =>
  (from: string, to: string): number =>
    pipe(
      // @ts-ignore
      () => graph.hasEdge(from, to),
      B.match(
        () =>
          E.left(
            new Error(`Could not find prefix factor from ${from} to ${to}`)
          ),
        () => E.right(graph.getEdgeWeight(from, to))
      ),
      E.getOrElse(notificationError(1))
    );

export const usePrefixConversion = () => {
  const store = useSelector((redux: Store) => redux.prefixConversions);
  const graph = useMemo(
    () =>
      pipe(
        store,
        O.fromNullable,
        O.map(prefixGraph),
        O.getOrElseW(() => null)
      ),
    [store]
  );
  const conversion = useCallback(
    (from: string, to: string): number | null => {
      if (!graph) return null;
      if (from.trim() === to.trim()) return 1;
      return getFactor(graph)(from.trim(), to.trim());
    },
    [graph]
  );

  return conversion;
};
