use ::entity::wish_list::*;

use crate::{paginate_query, ErrorFromExt};
use ::entity::dto::SubType;
use sea_orm::{sea_query::Expr, *};
use utils::*;
pub struct WishListQuery;

static COMPONENT: &str = "WishListQuery";
impl WishListQuery {
    pub async fn find_all_transactions(db: &DbConn) -> Result<Vec<wish_list::Model>, Error> {
        Entity::find().all(db).await.map_err(|e| {
            Error::from_db(
                format!("{}:FindAllTransactions", COMPONENT),
                "Failed to find all transactions",
                e,
                get_location!(),
            )
        })
    }
    pub async fn get_all(
        db: &DbConn,
        query: WishListPaginationQueryDto,
    ) -> Result<::entity::dto::pagination::PaginatedResult<wish_list::Model>, Error> {
        let stmt = query.get_query();

        // Pagination
        let paginated_result =
            paginate_query(stmt, db, query.pagination.page, query.pagination.limit)
                .await
                .map_err(|e| e.with_location(get_location!()))?;
        Ok(paginated_result)
    }

    pub async fn get_by_id(db: &DbConn, id: i64) -> Result<Option<wish_list::Model>, Error> {
        Entity::find_by_id(id).one(db).await.map_err(|e| {
            Error::from_db(
                format!("{}:GetById", COMPONENT),
                "Failed to get Wish List item by ID",
                e,
                get_location!(),
            )
        })
    }
    pub async fn find_by_url_name(
        db: &DbConn,
        url_name: &str,
    ) -> Result<Vec<wish_list::Model>, Error> {
        Entity::find()
            .filter(wish_list::Column::WfmUrl.contains(url_name))
            .all(db)
            .await
            .map_err(|e| {
                Error::from_db(
                    format!("{}:FindByUrlName", COMPONENT),
                    "Failed to find Wish List items by URL name",
                    e,
                    get_location!(),
                )
            })
    }

    pub async fn find_by_id(db: &DbConn, id: i64) -> Result<Option<wish_list::Model>, Error> {
        Entity::find_by_id(id).one(db).await.map_err(|e| {
            Error::from_db(
                format!("{}:FindById", COMPONENT),
                "Failed to find Wish List item by ID",
                e,
                get_location!(),
            )
        })
    }
    pub async fn find_by_ids(db: &DbConn, ids: Vec<i64>) -> Result<Vec<wish_list::Model>, Error> {
        Entity::find()
            .filter(Expr::col(wish_list::Column::Id).is_in(ids))
            .all(db)
            .await
            .map_err(|e| {
                Error::from_db(
                    format!("{}:FindByIds", COMPONENT),
                    "Failed to find Wish List items by IDs",
                    e,
                    get_location!(),
                )
            })
    }

    /// Batch query for multiple URL names with optional sub_types
    /// Returns a HashMap for O(1) lookups
    pub async fn find_by_url_names_batch(
        db: &DbConn,
        url_names: &[String],
    ) -> Result<std::collections::HashMap<String, Vec<wish_list::Model>>, Error> {
        let items = Entity::find()
            .filter(
                wish_list::Column::WfmUrl
                    .is_in(url_names.iter().map(|s| s.as_str()))
            )
            .all(db)
            .await
            .map_err(|e| {
                Error::from_db(
                    format!("{}:FindByUrlNamesBatch", COMPONENT),
                    "Failed to find Wish List items by URL names (batch)",
                    e,
                    get_location!(),
                )
            })?;

        // Group by URL name for fast lookup
        let mut map = std::collections::HashMap::new();
        for item in items {
            map.entry(item.wfm_url.clone())
                .or_insert_with(Vec::new)
                .push(item);
        }
        Ok(map)
    }

    pub async fn find_by_url_name_and_sub_type(
        db: &DbConn,
        url_name: &str,
        sub_type: Option<SubType>,
    ) -> Result<Option<wish_list::Model>, Error> {
        // Optimize: Filter sub_type in SQL instead of in Rust
        let mut query = Entity::find().filter(wish_list::Column::WfmUrl.contains(url_name));
        
        // Add sub_type filter if provided
        if let Some(ref st) = sub_type {
            let json_str = serde_json::to_string(st).unwrap_or_default();
            query = query.filter(wish_list::Column::SubType.eq(json_str));
        } else {
            query = query.filter(wish_list::Column::SubType.is_null());
        }
        
        query.one(db).await.map_err(|e| {
            Error::from_db(
                format!("{}:FindByUrlNameAndSubType", COMPONENT),
                "Failed to find Wish List item by URL name and sub type",
                e,
                get_location!(),
            )
        })
    }
}
