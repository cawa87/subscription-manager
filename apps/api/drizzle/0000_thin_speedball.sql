CREATE TABLE `digests` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`sections_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `digests_date_unique` ON `digests` (`date`);--> statement-breakpoint
CREATE TABLE `item_tags` (
	`item_id` text NOT NULL,
	`tag_id` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `item_tags_tag_idx` ON `item_tags` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `item_tags_item_id_tag_id_unique` ON `item_tags` (`item_id`,`tag_id`);--> statement-breakpoint
CREATE TABLE `item_topics` (
	`item_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`score` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `item_topics_topic_idx` ON `item_topics` (`topic_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `item_topics_item_id_topic_id_unique` ON `item_topics` (`item_id`,`topic_id`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`published_at` integer,
	`content_text` text,
	`content_html` text,
	`language` text,
	`hash` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `items_source_published_at_idx` ON `items` (`source_id`,`published_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `items_source_id_url_unique` ON `items` (`source_id`,`url`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`fetch_interval_minutes` integer DEFAULT 60 NOT NULL,
	`last_fetched_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_url_unique` ON `sources` (`url`);--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`model` text NOT NULL,
	`summary` text NOT NULL,
	`key_points_json` text,
	`sentiment` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `summaries_item_idx` ON `summaries` (`item_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `summaries_item_id_model_unique` ON `summaries` (`item_id`,`model`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`prompt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_name_unique` ON `topics` (`name`);