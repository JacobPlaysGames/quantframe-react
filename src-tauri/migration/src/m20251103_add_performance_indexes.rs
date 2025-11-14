use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add indexes to stock_item table
        manager
            .create_index(
                Index::create()
                    .name("idx_stock_item_wfm_url")
                    .table(StockItem::Table)
                    .col(StockItem::WfmUrl)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_stock_item_wfm_id")
                    .table(StockItem::Table)
                    .col(StockItem::WfmId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_stock_item_status")
                    .table(StockItem::Table)
                    .col(StockItem::Status)
                    .to_owned(),
            )
            .await?;

        // Add indexes to wish_list table
        manager
            .create_index(
                Index::create()
                    .name("idx_wish_list_wfm_url")
                    .table(WishList::Table)
                    .col(WishList::WfmUrl)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_wish_list_wfm_id")
                    .table(WishList::Table)
                    .col(WishList::WfmId)
                    .to_owned(),
            )
            .await?;

        // Add indexes to stock_riven table
        manager
            .create_index(
                Index::create()
                    .name("idx_stock_riven_wfm_weapon_url")
                    .table(StockRiven::Table)
                    .col(StockRiven::WfmWeaponUrl)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_stock_riven_uuid")
                    .table(StockRiven::Table)
                    .col(StockRiven::Uuid)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop all indexes
        manager
            .drop_index(
                Index::drop()
                    .name("idx_stock_item_wfm_url")
                    .table(StockItem::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_stock_item_wfm_id")
                    .table(StockItem::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_stock_item_status")
                    .table(StockItem::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_wish_list_wfm_url")
                    .table(WishList::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_wish_list_wfm_id")
                    .table(WishList::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_stock_riven_wfm_weapon_url")
                    .table(StockRiven::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_index(
                Index::drop()
                    .name("idx_stock_riven_uuid")
                    .table(StockRiven::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum StockItem {
    Table,
    WfmUrl,
    WfmId,
    Status,
}

#[derive(DeriveIden)]
enum WishList {
    Table,
    WfmUrl,
    WfmId,
}

#[derive(DeriveIden)]
enum StockRiven {
    Table,
    WfmWeaponUrl,
    Uuid,
}
