CREATE TYPE click_device AS ENUM ('mobile', 'desktop', 'tablet', 'unknown');

CREATE TABLE clicks (
    id BIGSERIAL PRIMARY KEY,
    short_url_id BIGINT NOT NULL,
    clicked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    country VARCHAR(100),
    device click_device,
    CONSTRAINT fk_clicks_short_url
        FOREIGN KEY (short_url_id)
        REFERENCES short_urls (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_clicks_short_url_id ON clicks (short_url_id);
CREATE INDEX idx_clicks_clicked_at ON clicks (clicked_at);
CREATE INDEX idx_clicks_short_url_id_clicked_at ON clicks (short_url_id, clicked_at);
