import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query";

/**
 * Prefetch helper for Server Components
 * Wraps children with hydration boundary for SSR data prefetching
 * 
 * Usage:
 * ```tsx
 * export default async function Page() {
 *   const queryClient = new QueryClient();
 *   await queryClient.prefetchQuery({
 *     queryKey: ['users', 'me'],
 *     queryFn: () => api().then(a => a.users.getMe()),
 *   });
 *   
 *   return (
 *     <HydrateClient queryClient={queryClient}>
 *       <ClientComponent />
 *     </HydrateClient>
 *   );
 * }
 * ```
 */
export function HydrateClient({
    children,
    queryClient,
}: {
    children: React.ReactNode;
    queryClient: QueryClient;
}) {
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
}

export { QueryClient };
