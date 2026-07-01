import { TauriTypes, WFMarketTypes } from "$types";
import api from "@api/index";
import { createGenericMutation, MutationHooks } from "@utils/genericMutation.helper";

/**
 * Extracts a properly typed SubType from a WFM Order.
 * Order uses camelCase (amberStars, cyanStars, subtype) while SubType
 * uses snake_case (amber_stars, cyan_stars, variant). Passing the full
 * Order object as sub_type silently drops star/variant metadata.
 */
const orderToSubType = (data: WFMarketTypes.Order): TauriTypes.SubType | undefined => {
  const subType: TauriTypes.SubType = {};
  // Only include rank if meaningful (> 0); rank 0 signals "not applicable" for most items
  if (data.rank > 0) subType.rank = data.rank;
  if (data.amberStars !== undefined) subType.amber_stars = data.amberStars;
  if (data.cyanStars !== undefined) subType.cyan_stars = data.cyanStars;
  // subtype holds relic/variant strings (e.g. "intact", "radiant")
  if (data.subtype) subType.variant = data.subtype;
  return Object.keys(subType).length > 0 ? subType : undefined;
};

export const useStockMutations = ({ refetchQueries, setLoadingRows }: MutationHooks) => {
  const hooks = { refetchQueries, setLoadingRows };

  const refreshOrdersMutation = createGenericMutation(
    {
      mutationFn: () => api.order.refreshOrders(),
      successKey: "refresh_orders",
      errorKey: "refresh_orders",
    },
    hooks,
  );

  const deleteAllOrdersMutation = createGenericMutation(
    {
      mutationFn: (order_type?: WFMarketTypes.OrderType) => api.order.deleteAllOrders(order_type),
      successKey: "delete_all_orders",
      errorKey: "delete_all_orders",
    },
    hooks,
  );

  const createStockMutation = createGenericMutation(
    {
      mutationFn: (data: WFMarketTypes.Order) =>
        api.stock_item.create(
          {
            raw: data.itemId,
            quantity: data.quantity,
            sub_type: orderToSubType(data),
            bought: data.platinum,
          },
          "id",
        ),
      successKey: "create_stock_item",
      errorKey: "create_stock_item",
      getSuccessMessage: (data: any) => ({ name: data.item_name }),
    },
    hooks,
  );

  const sellStockMutation = createGenericMutation(
    {
      mutationFn: (data: WFMarketTypes.Order) =>
        api.stock_item.sell(
          {
            id: -1,
            wfm_url: data.itemId,
            sub_type: orderToSubType(data),
            price: data.platinum,
            quantity: data.quantity,
          },
          "id",
        ),
      successKey: "sell_stock_item",
      errorKey: "sell_stock_item",
      getLoadingId: (variables: WFMarketTypes.Order) => `${variables.id}`,
      getSuccessMessage: (data: any) => ({ name: data.item_name }),
    },
    hooks,
  );

  const deleteStockMutation = createGenericMutation(
    {
      mutationFn: (id: string) => api.order.deleteById(id),
      successKey: "delete_order",
      errorKey: "delete_order",
      getLoadingId: (variables: string) => `${variables}`,
    },
    hooks,
  );

  return {
    refreshOrdersMutation,
    deleteAllOrdersMutation,
    createStockMutation,
    sellStockMutation,
    deleteStockMutation,
  };
};
