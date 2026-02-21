--
-- PostgreSQL database dump
--

\restrict xvOqkSiUqkgIbtBFD8zdYdHGUD7aN3K4V55FfXdSVtSLMsYf6arAO99C1Uvlm5D

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    account_id integer NOT NULL,
    account_code character varying(50) NOT NULL,
    account_name character varying(200) NOT NULL,
    account_type character varying(50) NOT NULL,
    current_balance numeric(18,2) DEFAULT 0 NOT NULL,
    balance_type character varying(2),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: accounts_account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounts_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounts_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounts_account_id_seq OWNED BY public.accounts.account_id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    audit_log_id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id bigint,
    details jsonb,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_log_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_audit_log_id_seq OWNED BY public.audit_log.audit_log_id;


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    bank_account_id integer NOT NULL,
    account_code character varying(50) NOT NULL,
    account_name character varying(200) NOT NULL,
    bank_name character varying(200),
    account_id integer,
    current_balance numeric(18,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: bank_accounts_bank_account_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_accounts_bank_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bank_accounts_bank_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_accounts_bank_account_id_seq OWNED BY public.bank_accounts.bank_account_id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    branch_id integer NOT NULL,
    branch_code character varying(50) NOT NULL,
    branch_name character varying(200) NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: branches_branch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_branch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_branch_id_seq OWNED BY public.branches.branch_id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    brand_id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_brand_id_seq OWNED BY public.brands.brand_id;


--
-- Name: business_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_info (
    business_info_id integer NOT NULL,
    business_name character varying(200) NOT NULL,
    address text,
    phone character varying(50),
    email character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE business_info; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.business_info IS 'Single row: shop name, address, phone for receipts and reports';


--
-- Name: business_info_business_info_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.business_info_business_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: business_info_business_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.business_info_business_info_id_seq OWNED BY public.business_info.business_info_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: customer_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_receipts (
    customer_receipt_id integer NOT NULL,
    receipt_number character varying(50) NOT NULL,
    branch_id integer,
    receipt_date date NOT NULL,
    customer_id integer NOT NULL,
    bank_account_id integer NOT NULL,
    amount numeric(18,2) NOT NULL,
    description character varying(500),
    payment_method_id integer,
    user_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: customer_receipts_customer_receipt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_receipts_customer_receipt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_receipts_customer_receipt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_receipts_customer_receipt_id_seq OWNED BY public.customer_receipts.customer_receipt_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    customer_id integer NOT NULL,
    account_id integer NOT NULL,
    customer_code character varying(50),
    name character varying(200) NOT NULL,
    name_english character varying(200),
    contact_person character varying(200),
    mobile character varying(50),
    address text,
    city character varying(100),
    phone character varying(50),
    fax character varying(50),
    email character varying(100),
    goods_company character varying(200),
    reference character varying(200),
    credit_limit numeric(18,2) DEFAULT 0 NOT NULL,
    joining_date date DEFAULT CURRENT_DATE,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- Name: delivery_modes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_modes (
    delivery_mode_id integer NOT NULL,
    mode_name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: delivery_modes_delivery_mode_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_modes_delivery_mode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delivery_modes_delivery_mode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_modes_delivery_mode_id_seq OWNED BY public.delivery_modes.delivery_mode_id;


--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ledger_entries (
    ledger_entry_id integer NOT NULL,
    voucher_no character varying(50) NOT NULL,
    account_id integer NOT NULL,
    transaction_date date NOT NULL,
    description character varying(500),
    debit_amount numeric(18,2) DEFAULT 0 NOT NULL,
    credit_amount numeric(18,2) DEFAULT 0 NOT NULL,
    ref_type character varying(50),
    ref_id bigint,
    created_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ledger_entries_ledger_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ledger_entries_ledger_entry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ledger_entries_ledger_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ledger_entries_ledger_entry_id_seq OWNED BY public.ledger_entries.ledger_entry_id;


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    payment_method_id integer NOT NULL,
    method_name character varying(100) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payment_methods_payment_method_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_methods_payment_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_methods_payment_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_methods_payment_method_id_seq OWNED BY public.payment_methods.payment_method_id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    code character varying(50) NOT NULL,
    name_en character varying(300) NOT NULL,
    name_ur character varying(300),
    brand_id integer,
    category_id integer,
    title character varying(200),
    description text,
    uom_id integer NOT NULL,
    min_stock_level integer DEFAULT 0 NOT NULL,
    cost_price numeric(18,2) DEFAULT 0 NOT NULL,
    selling_price numeric(18,2) DEFAULT 0 NOT NULL,
    current_stock numeric(18,4) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    purchase_order_item_id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity numeric(18,4) NOT NULL,
    unit_price numeric(18,2) NOT NULL,
    line_total numeric(18,2) NOT NULL,
    uom_id integer,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: purchase_order_items_purchase_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_purchase_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_purchase_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_purchase_order_item_id_seq OWNED BY public.purchase_order_items.purchase_order_item_id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    purchase_order_id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    supplier_id integer NOT NULL,
    user_id integer,
    order_date date NOT NULL,
    total_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'DRAFT'::character varying NOT NULL,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: purchase_orders_purchase_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_purchase_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_purchase_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_purchase_order_id_seq OWNED BY public.purchase_orders.purchase_order_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    role_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_role_id_seq OWNED BY public.roles.role_id;


--
-- Name: sales_invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoice_items (
    sales_invoice_item_id integer NOT NULL,
    sales_invoice_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity numeric(18,4) NOT NULL,
    unit_price numeric(18,2) NOT NULL,
    line_total numeric(18,2) NOT NULL,
    uom_id integer,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sales_invoice_items_sales_invoice_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_invoice_items_sales_invoice_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_invoice_items_sales_invoice_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_invoice_items_sales_invoice_item_id_seq OWNED BY public.sales_invoice_items.sales_invoice_item_id;


--
-- Name: sales_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_invoices (
    sales_invoice_id integer NOT NULL,
    invoice_number character varying(50) NOT NULL,
    branch_id integer,
    customer_id integer,
    user_id integer NOT NULL,
    invoice_date date NOT NULL,
    invoice_time time without time zone,
    transaction_type_id integer NOT NULL,
    delivery_mode_id integer,
    is_cash_customer boolean DEFAULT false NOT NULL,
    grand_total numeric(18,2) DEFAULT 0 NOT NULL,
    additional_discount numeric(18,2) DEFAULT 0 NOT NULL,
    additional_expenses numeric(18,2) DEFAULT 0 NOT NULL,
    net_total numeric(18,2) DEFAULT 0 NOT NULL,
    amount_received numeric(18,2) DEFAULT 0 NOT NULL,
    remarks text,
    billing_no character varying(100),
    billing_date date,
    billing_packing character varying(100),
    billing_adda character varying(200),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: sales_invoices_sales_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_invoices_sales_invoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_invoices_sales_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_invoices_sales_invoice_id_seq OWNED BY public.sales_invoices.sales_invoice_id;


--
-- Name: stock_transaction_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transaction_items (
    stock_transaction_item_id integer NOT NULL,
    stock_transaction_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity_change numeric(18,4) NOT NULL,
    price_at_transaction numeric(18,2),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_transaction_items_stock_transaction_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_transaction_items_stock_transaction_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_transaction_items_stock_transaction_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_transaction_items_stock_transaction_item_id_seq OWNED BY public.stock_transaction_items.stock_transaction_item_id;


--
-- Name: stock_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transactions (
    stock_transaction_id integer NOT NULL,
    record_no character varying(50) NOT NULL,
    branch_id integer,
    transaction_date date NOT NULL,
    transaction_type_id integer NOT NULL,
    description character varying(500),
    user_id integer,
    ref_sales_invoice_id integer,
    ref_purchase_order_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_transactions_stock_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_transactions_stock_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_transactions_stock_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_transactions_stock_transaction_id_seq OWNED BY public.stock_transactions.stock_transaction_id;


--
-- Name: supplier_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier_payments (
    supplier_payment_id integer NOT NULL,
    voucher_no character varying(50) NOT NULL,
    branch_id integer,
    payment_date date NOT NULL,
    supplier_id integer NOT NULL,
    bank_account_id integer NOT NULL,
    amount numeric(18,2) NOT NULL,
    description character varying(500),
    payment_method_id integer,
    user_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: supplier_payments_supplier_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplier_payments_supplier_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supplier_payments_supplier_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplier_payments_supplier_payment_id_seq OWNED BY public.supplier_payments.supplier_payment_id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    supplier_id integer NOT NULL,
    account_id integer NOT NULL,
    supplier_code character varying(50),
    name character varying(200) NOT NULL,
    contact_person character varying(200),
    mobile character varying(50),
    address text,
    city character varying(100),
    phone character varying(50),
    fax character varying(50),
    email character varying(100),
    reference character varying(200),
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_supplier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_supplier_id_seq OWNED BY public.suppliers.supplier_id;


--
-- Name: transaction_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transaction_types (
    transaction_type_id integer NOT NULL,
    type_code character varying(50) NOT NULL,
    type_name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: transaction_types_transaction_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transaction_types_transaction_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transaction_types_transaction_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transaction_types_transaction_type_id_seq OWNED BY public.transaction_types.transaction_type_id;


--
-- Name: units_of_measure; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.units_of_measure (
    uom_id integer NOT NULL,
    name character varying(50) NOT NULL,
    symbol character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: units_of_measure_uom_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.units_of_measure_uom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: units_of_measure_uom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.units_of_measure_uom_id_seq OWNED BY public.units_of_measure.uom_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(200),
    role_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: v_ledger_running_balance; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_ledger_running_balance AS
 SELECT ledger_entries.ledger_entry_id,
    ledger_entries.voucher_no,
    ledger_entries.account_id,
    ledger_entries.transaction_date,
    ledger_entries.description,
    ledger_entries.debit_amount,
    ledger_entries.credit_amount,
    ledger_entries.ref_type,
    ledger_entries.ref_id,
    sum((ledger_entries.debit_amount - ledger_entries.credit_amount)) OVER (PARTITION BY ledger_entries.account_id ORDER BY ledger_entries.transaction_date, ledger_entries.ledger_entry_id ROWS UNBOUNDED PRECEDING) AS running_balance,
        CASE
            WHEN (sum((ledger_entries.debit_amount - ledger_entries.credit_amount)) OVER (PARTITION BY ledger_entries.account_id ORDER BY ledger_entries.transaction_date, ledger_entries.ledger_entry_id ROWS UNBOUNDED PRECEDING) >= (0)::numeric) THEN 'Dr'::text
            ELSE 'Cr'::text
        END AS balance_type
   FROM public.ledger_entries;


--
-- Name: VIEW v_ledger_running_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.v_ledger_running_balance IS 'Running balance per ledger entry for account ledger reports';


--
-- Name: accounts account_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts ALTER COLUMN account_id SET DEFAULT nextval('public.accounts_account_id_seq'::regclass);


--
-- Name: audit_log audit_log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN audit_log_id SET DEFAULT nextval('public.audit_log_audit_log_id_seq'::regclass);


--
-- Name: bank_accounts bank_account_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN bank_account_id SET DEFAULT nextval('public.bank_accounts_bank_account_id_seq'::regclass);


--
-- Name: branches branch_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN branch_id SET DEFAULT nextval('public.branches_branch_id_seq'::regclass);


--
-- Name: brands brand_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN brand_id SET DEFAULT nextval('public.brands_brand_id_seq'::regclass);


--
-- Name: business_info business_info_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_info ALTER COLUMN business_info_id SET DEFAULT nextval('public.business_info_business_info_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: customer_receipts customer_receipt_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts ALTER COLUMN customer_receipt_id SET DEFAULT nextval('public.customer_receipts_customer_receipt_id_seq'::regclass);


--
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- Name: delivery_modes delivery_mode_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_modes ALTER COLUMN delivery_mode_id SET DEFAULT nextval('public.delivery_modes_delivery_mode_id_seq'::regclass);


--
-- Name: ledger_entries ledger_entry_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries ALTER COLUMN ledger_entry_id SET DEFAULT nextval('public.ledger_entries_ledger_entry_id_seq'::regclass);


--
-- Name: payment_methods payment_method_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN payment_method_id SET DEFAULT nextval('public.payment_methods_payment_method_id_seq'::regclass);


--
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- Name: purchase_order_items purchase_order_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN purchase_order_item_id SET DEFAULT nextval('public.purchase_order_items_purchase_order_item_id_seq'::regclass);


--
-- Name: purchase_orders purchase_order_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN purchase_order_id SET DEFAULT nextval('public.purchase_orders_purchase_order_id_seq'::regclass);


--
-- Name: roles role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN role_id SET DEFAULT nextval('public.roles_role_id_seq'::regclass);


--
-- Name: sales_invoice_items sales_invoice_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items ALTER COLUMN sales_invoice_item_id SET DEFAULT nextval('public.sales_invoice_items_sales_invoice_item_id_seq'::regclass);


--
-- Name: sales_invoices sales_invoice_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices ALTER COLUMN sales_invoice_id SET DEFAULT nextval('public.sales_invoices_sales_invoice_id_seq'::regclass);


--
-- Name: stock_transaction_items stock_transaction_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transaction_items ALTER COLUMN stock_transaction_item_id SET DEFAULT nextval('public.stock_transaction_items_stock_transaction_item_id_seq'::regclass);


--
-- Name: stock_transactions stock_transaction_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions ALTER COLUMN stock_transaction_id SET DEFAULT nextval('public.stock_transactions_stock_transaction_id_seq'::regclass);


--
-- Name: supplier_payments supplier_payment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments ALTER COLUMN supplier_payment_id SET DEFAULT nextval('public.supplier_payments_supplier_payment_id_seq'::regclass);


--
-- Name: suppliers supplier_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN supplier_id SET DEFAULT nextval('public.suppliers_supplier_id_seq'::regclass);


--
-- Name: transaction_types transaction_type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_types ALTER COLUMN transaction_type_id SET DEFAULT nextval('public.transaction_types_transaction_type_id_seq'::regclass);


--
-- Name: units_of_measure uom_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure ALTER COLUMN uom_id SET DEFAULT nextval('public.units_of_measure_uom_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (account_id, account_code, account_name, account_type, current_balance, balance_type, is_active, created_at, updated_at) FROM stdin;
1	REV001	Sales Revenue	Revenue	0.00	\N	t	2026-02-18 20:32:04.555881+00	2026-02-18 20:32:04.555881+00
2	INV001	Inventory	Inventory	0.00	\N	t	2026-02-18 20:32:04.558683+00	2026-02-18 20:32:04.558683+00
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_log (audit_log_id, user_id, action, entity_type, entity_id, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_accounts (bank_account_id, account_code, account_name, bank_name, account_id, current_balance, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (branch_id, branch_code, branch_name, address, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (brand_id, name, created_at) FROM stdin;
1	Teetar	2026-02-20 11:39:51.94627+00
2	Munir	2026-02-20 11:39:51.94627+00
3	Rang Register	2026-02-20 11:39:51.94627+00
\.


--
-- Data for Name: business_info; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_info (business_info_id, business_name, address, phone, email, created_at, updated_at) FROM stdin;
1	MUNIR COPY HOUSE	Kabir Street, Urdu Bazar, Lahore.	Ph: 042-37321351	\N	2026-02-18 20:32:04.560137+00	2026-02-18 20:32:04.560137+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (category_id, name, created_at) FROM stdin;
1	Card Register	2026-02-20 11:40:11.773101+00
2	Ring Register	2026-02-20 11:40:11.773101+00
3	Stationery	2026-02-20 11:40:11.773101+00
\.


--
-- Data for Name: customer_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_receipts (customer_receipt_id, receipt_number, branch_id, receipt_date, customer_id, bank_account_id, amount, description, payment_method_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (customer_id, account_id, customer_code, name, name_english, contact_person, mobile, address, city, phone, fax, email, goods_company, reference, credit_limit, joining_date, is_active, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_modes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_modes (delivery_mode_id, mode_name, created_at) FROM stdin;
1	Counter	2026-02-18 20:32:04.550271+00
2	Delivery	2026-02-18 20:32:04.550271+00
\.


--
-- Data for Name: ledger_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ledger_entries (ledger_entry_id, voucher_no, account_id, transaction_date, description, debit_amount, credit_amount, ref_type, ref_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (payment_method_id, method_name, description, created_at) FROM stdin;
1	Cash	Cash payment	2026-02-18 20:32:04.547918+00
2	Cheque	Cheque payment	2026-02-18 20:32:04.547918+00
3	Bank Transfer	Bank transfer	2026-02-18 20:32:04.547918+00
4	Online	Online payment (e.g. ONLINE MZ)	2026-02-18 20:32:04.547918+00
5	Card	Card payment	2026-02-18 20:32:04.547918+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (product_id, code, name_en, name_ur, brand_id, category_id, title, description, uom_id, min_stock_level, cost_price, selling_price, current_stock, is_active, deleted_at, created_at, updated_at) FROM stdin;
1	490	Register No 500 Broad Line	رجسٹر نمبر 500 براڈ لائن	1	1	\N	\N	2	5	2000.00	2196.00	5604.0000	t	\N	2026-02-20 11:40:25.954392+00	2026-02-20 11:40:25.954392+00
2	491	Register No 500 Narrow Line	رجسٹر نمبر 500 نیرو لائن	1	1	\N	\N	2	5	2000.00	2196.00	358.0000	t	\N	2026-02-20 11:40:25.954392+00	2026-02-20 11:40:25.954392+00
3	530	Ring Register No 500 Broad Line	رنگ رجسٹر نمبر 500 براڈ لائن	3	2	\N	\N	2	5	1800.00	1980.00	86.0000	t	\N	2026-02-20 11:40:25.954392+00	2026-02-20 11:40:25.954392+00
4	208	Copy No 200 4 Line Munir	کاپی نمبر 200 4 لائن منیر	2	3	\N	\N	2	5	550.00	624.00	1200.0000	t	\N	2026-02-20 11:40:25.954392+00	2026-02-20 11:40:25.954392+00
5	403	Register No 500 Khilarol	رجسٹر نمبر 500 كهلارول	2	1	\N	\N	2	5	2000.00	2196.00	5604.0000	t	\N	2026-02-20 11:40:25.954392+00	2026-02-20 11:40:25.954392+00
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (purchase_order_item_id, purchase_order_id, product_id, quantity, unit_price, line_total, uom_id, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (purchase_order_id, order_number, supplier_id, user_id, order_date, total_amount, status, remarks, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (role_id, role_name, description, created_at) FROM stdin;
1	Admin	Full system access	2026-02-18 20:32:04.543466+00
2	Manager	Reports, management, override	2026-02-18 20:32:04.543466+00
3	Cashier	POS, sales, receipts	2026-02-18 20:32:04.543466+00
\.


--
-- Data for Name: sales_invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoice_items (sales_invoice_item_id, sales_invoice_id, product_id, quantity, unit_price, line_total, uom_id, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: sales_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_invoices (sales_invoice_id, invoice_number, branch_id, customer_id, user_id, invoice_date, invoice_time, transaction_type_id, delivery_mode_id, is_cash_customer, grand_total, additional_discount, additional_expenses, net_total, amount_received, remarks, billing_no, billing_date, billing_packing, billing_adda, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_transaction_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_transaction_items (stock_transaction_item_id, stock_transaction_id, product_id, quantity_change, price_at_transaction, created_at) FROM stdin;
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_transactions (stock_transaction_id, record_no, branch_id, transaction_date, transaction_type_id, description, user_id, ref_sales_invoice_id, ref_purchase_order_id, created_at) FROM stdin;
\.


--
-- Data for Name: supplier_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplier_payments (supplier_payment_id, voucher_no, branch_id, payment_date, supplier_id, bank_account_id, amount, description, payment_method_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (supplier_id, account_id, supplier_code, name, contact_person, mobile, address, city, phone, fax, email, reference, is_active, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transaction_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transaction_types (transaction_type_id, type_code, type_name, category, created_at) FROM stdin;
1	SALE	Sale	SALE	2026-02-18 20:32:04.552714+00
2	RETURN	Return	SALE	2026-02-18 20:32:04.552714+00
3	STOCK_IN	Stock In	STOCK	2026-02-18 20:32:04.552714+00
4	STOCK_OUT	Stock Out	STOCK	2026-02-18 20:32:04.552714+00
\.


--
-- Data for Name: units_of_measure; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.units_of_measure (uom_id, name, symbol, created_at) FROM stdin;
1	Pcs	pcs	2026-02-18 20:32:04.568125+00
2	Dozen	doz	2026-02-18 20:32:04.568125+00
3	Gurus	gurus	2026-02-18 20:32:04.568125+00
4	Kg	kg	2026-02-18 20:32:04.568125+00
5	Ream	ream	2026-02-18 20:32:04.568125+00
6	Packet	pkt	2026-02-18 20:32:04.568125+00
7	Roll	roll	2026-02-18 20:32:04.568125+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, username, password_hash, full_name, role_id, is_active, deleted_at, created_at, updated_at) FROM stdin;
1	admin	$2a$10$Vr7cEoCR8VMdB0UyrZKn5.sFDdZLzm49BOmL/evaJwPmPo/Ha80zG	System Admin	1	t	\N	2026-02-18 20:32:04.562309+00	2026-02-18 20:32:04.562309+00
\.


--
-- Name: accounts_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.accounts_account_id_seq', 2, true);


--
-- Name: audit_log_audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_log_audit_log_id_seq', 1, false);


--
-- Name: bank_accounts_bank_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_accounts_bank_account_id_seq', 1, false);


--
-- Name: branches_branch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branches_branch_id_seq', 1, false);


--
-- Name: brands_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.brands_brand_id_seq', 3, true);


--
-- Name: business_info_business_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.business_info_business_info_id_seq', 1, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 3, true);


--
-- Name: customer_receipts_customer_receipt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customer_receipts_customer_receipt_id_seq', 1, false);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_customer_id_seq', 1, false);


--
-- Name: delivery_modes_delivery_mode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.delivery_modes_delivery_mode_id_seq', 2, true);


--
-- Name: ledger_entries_ledger_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ledger_entries_ledger_entry_id_seq', 1, false);


--
-- Name: payment_methods_payment_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_methods_payment_method_id_seq', 5, true);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_product_id_seq', 5, true);


--
-- Name: purchase_order_items_purchase_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_order_items_purchase_order_item_id_seq', 1, false);


--
-- Name: purchase_orders_purchase_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_purchase_order_id_seq', 1, false);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_role_id_seq', 3, true);


--
-- Name: sales_invoice_items_sales_invoice_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_invoice_items_sales_invoice_item_id_seq', 1, false);


--
-- Name: sales_invoices_sales_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sales_invoices_sales_invoice_id_seq', 1, false);


--
-- Name: stock_transaction_items_stock_transaction_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_transaction_items_stock_transaction_item_id_seq', 1, false);


--
-- Name: stock_transactions_stock_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_transactions_stock_transaction_id_seq', 1, false);


--
-- Name: supplier_payments_supplier_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplier_payments_supplier_payment_id_seq', 1, false);


--
-- Name: suppliers_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_supplier_id_seq', 1, false);


--
-- Name: transaction_types_transaction_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transaction_types_transaction_type_id_seq', 4, true);


--
-- Name: units_of_measure_uom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.units_of_measure_uom_id_seq', 7, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- Name: accounts accounts_account_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_account_code_key UNIQUE (account_code);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (account_id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (audit_log_id);


--
-- Name: bank_accounts bank_accounts_account_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_account_code_key UNIQUE (account_code);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (bank_account_id);


--
-- Name: branches branches_branch_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_branch_code_key UNIQUE (branch_code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (branch_id);


--
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (brand_id);


--
-- Name: business_info business_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_info
    ADD CONSTRAINT business_info_pkey PRIMARY KEY (business_info_id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: customer_receipts customer_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_pkey PRIMARY KEY (customer_receipt_id);


--
-- Name: customer_receipts customer_receipts_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_receipt_number_key UNIQUE (receipt_number);


--
-- Name: customers customers_customer_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: delivery_modes delivery_modes_mode_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_modes
    ADD CONSTRAINT delivery_modes_mode_name_key UNIQUE (mode_name);


--
-- Name: delivery_modes delivery_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_modes
    ADD CONSTRAINT delivery_modes_pkey PRIMARY KEY (delivery_mode_id);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (ledger_entry_id);


--
-- Name: payment_methods payment_methods_method_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_method_name_key UNIQUE (method_name);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (payment_method_id);


--
-- Name: products products_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_code_key UNIQUE (code);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (purchase_order_item_id);


--
-- Name: purchase_orders purchase_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_order_number_key UNIQUE (order_number);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (purchase_order_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: sales_invoice_items sales_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_pkey PRIMARY KEY (sales_invoice_item_id);


--
-- Name: sales_invoices sales_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: sales_invoices sales_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_pkey PRIMARY KEY (sales_invoice_id);


--
-- Name: stock_transaction_items stock_transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transaction_items
    ADD CONSTRAINT stock_transaction_items_pkey PRIMARY KEY (stock_transaction_item_id);


--
-- Name: stock_transactions stock_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_pkey PRIMARY KEY (stock_transaction_id);


--
-- Name: stock_transactions stock_transactions_record_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_record_no_key UNIQUE (record_no);


--
-- Name: supplier_payments supplier_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_pkey PRIMARY KEY (supplier_payment_id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id);


--
-- Name: suppliers suppliers_supplier_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_supplier_code_key UNIQUE (supplier_code);


--
-- Name: transaction_types transaction_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_types
    ADD CONSTRAINT transaction_types_pkey PRIMARY KEY (transaction_type_id);


--
-- Name: transaction_types transaction_types_type_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transaction_types
    ADD CONSTRAINT transaction_types_type_code_key UNIQUE (type_code);


--
-- Name: units_of_measure units_of_measure_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure
    ADD CONSTRAINT units_of_measure_name_key UNIQUE (name);


--
-- Name: units_of_measure units_of_measure_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.units_of_measure
    ADD CONSTRAINT units_of_measure_pkey PRIMARY KEY (uom_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_accounts_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_code ON public.accounts USING btree (account_code);


--
-- Name: idx_accounts_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_accounts_type ON public.accounts USING btree (account_type);


--
-- Name: idx_audit_log_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_created ON public.audit_log USING btree (created_at);


--
-- Name: idx_audit_log_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_entity ON public.audit_log USING btree (entity_type, entity_id);


--
-- Name: idx_audit_log_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_log_user ON public.audit_log USING btree (user_id);


--
-- Name: idx_bank_accounts_account_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_account_id ON public.bank_accounts USING btree (account_id);


--
-- Name: idx_branches_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_code ON public.branches USING btree (branch_code);


--
-- Name: idx_customer_receipts_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_receipts_customer ON public.customer_receipts USING btree (customer_id);


--
-- Name: idx_customer_receipts_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_receipts_date ON public.customer_receipts USING btree (receipt_date);


--
-- Name: idx_customer_receipts_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_receipts_number ON public.customer_receipts USING btree (receipt_number);


--
-- Name: idx_customers_account; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_customers_account ON public.customers USING btree (account_id);


--
-- Name: idx_customers_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_city ON public.customers USING btree (city);


--
-- Name: idx_customers_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_code ON public.customers USING btree (customer_code);


--
-- Name: idx_customers_mobile; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_mobile ON public.customers USING btree (mobile);


--
-- Name: idx_customers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_name ON public.customers USING btree (name);


--
-- Name: idx_ledger_entries_account_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ledger_entries_account_date ON public.ledger_entries USING btree (account_id, transaction_date);


--
-- Name: idx_ledger_entries_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ledger_entries_date ON public.ledger_entries USING btree (transaction_date);


--
-- Name: idx_ledger_entries_date_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ledger_entries_date_account ON public.ledger_entries USING btree (transaction_date, account_id);


--
-- Name: idx_ledger_entries_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ledger_entries_ref ON public.ledger_entries USING btree (ref_type, ref_id);


--
-- Name: idx_ledger_entries_voucher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ledger_entries_voucher ON public.ledger_entries USING btree (voucher_no);


--
-- Name: idx_products_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_brand ON public.products USING btree (brand_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_code ON public.products USING btree (code);


--
-- Name: idx_products_current_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_current_stock ON public.products USING btree (current_stock);


--
-- Name: idx_products_name_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name_en ON public.products USING btree (name_en);


--
-- Name: idx_products_name_ur; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name_ur ON public.products USING btree (name_ur);


--
-- Name: idx_purchase_order_items_po; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_order_items_po ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: idx_purchase_order_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_order_items_product ON public.purchase_order_items USING btree (product_id);


--
-- Name: idx_purchase_orders_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_date ON public.purchase_orders USING btree (order_date);


--
-- Name: idx_purchase_orders_supplier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders USING btree (supplier_id);


--
-- Name: idx_sales_invoice_items_invoice; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoice_items_invoice ON public.sales_invoice_items USING btree (sales_invoice_id);


--
-- Name: idx_sales_invoice_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoice_items_product ON public.sales_invoice_items USING btree (product_id);


--
-- Name: idx_sales_invoices_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoices_customer ON public.sales_invoices USING btree (customer_id);


--
-- Name: idx_sales_invoices_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoices_date ON public.sales_invoices USING btree (invoice_date);


--
-- Name: idx_sales_invoices_date_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoices_date_customer ON public.sales_invoices USING btree (invoice_date, customer_id);


--
-- Name: idx_sales_invoices_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoices_number ON public.sales_invoices USING btree (invoice_number);


--
-- Name: idx_sales_invoices_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_invoices_user ON public.sales_invoices USING btree (user_id);


--
-- Name: idx_stock_transaction_items_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transaction_items_product ON public.stock_transaction_items USING btree (product_id);


--
-- Name: idx_stock_transaction_items_txn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transaction_items_txn ON public.stock_transaction_items USING btree (stock_transaction_id);


--
-- Name: idx_stock_transactions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transactions_date ON public.stock_transactions USING btree (transaction_date);


--
-- Name: idx_stock_transactions_record; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transactions_record ON public.stock_transactions USING btree (record_no);


--
-- Name: idx_stock_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transactions_type ON public.stock_transactions USING btree (transaction_type_id);


--
-- Name: idx_supplier_payments_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplier_payments_date ON public.supplier_payments USING btree (payment_date);


--
-- Name: idx_supplier_payments_supplier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplier_payments_supplier ON public.supplier_payments USING btree (supplier_id);


--
-- Name: idx_suppliers_account; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_suppliers_account ON public.suppliers USING btree (account_id);


--
-- Name: idx_suppliers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suppliers_name ON public.suppliers USING btree (name);


--
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: bank_accounts bank_accounts_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);


--
-- Name: customer_receipts customer_receipts_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(bank_account_id);


--
-- Name: customer_receipts customer_receipts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(branch_id);


--
-- Name: customer_receipts customer_receipts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: customer_receipts customer_receipts_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(payment_method_id);


--
-- Name: customer_receipts customer_receipts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_receipts
    ADD CONSTRAINT customer_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: customers customers_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);


--
-- Name: stock_transactions fk_stock_transactions_ref_purchase; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT fk_stock_transactions_ref_purchase FOREIGN KEY (ref_purchase_order_id) REFERENCES public.purchase_orders(purchase_order_id);


--
-- Name: ledger_entries ledger_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);


--
-- Name: ledger_entries ledger_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);


--
-- Name: products products_uom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_uom_id_fkey FOREIGN KEY (uom_id) REFERENCES public.units_of_measure(uom_id);


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(purchase_order_id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_uom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_uom_id_fkey FOREIGN KEY (uom_id) REFERENCES public.units_of_measure(uom_id);


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: purchase_orders purchase_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: sales_invoice_items sales_invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: sales_invoice_items sales_invoice_items_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.sales_invoices(sales_invoice_id) ON DELETE CASCADE;


--
-- Name: sales_invoice_items sales_invoice_items_uom_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoice_items
    ADD CONSTRAINT sales_invoice_items_uom_id_fkey FOREIGN KEY (uom_id) REFERENCES public.units_of_measure(uom_id);


--
-- Name: sales_invoices sales_invoices_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(branch_id);


--
-- Name: sales_invoices sales_invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: sales_invoices sales_invoices_delivery_mode_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_delivery_mode_id_fkey FOREIGN KEY (delivery_mode_id) REFERENCES public.delivery_modes(delivery_mode_id);


--
-- Name: sales_invoices sales_invoices_transaction_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_transaction_type_id_fkey FOREIGN KEY (transaction_type_id) REFERENCES public.transaction_types(transaction_type_id);


--
-- Name: sales_invoices sales_invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_invoices
    ADD CONSTRAINT sales_invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: stock_transaction_items stock_transaction_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transaction_items
    ADD CONSTRAINT stock_transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- Name: stock_transaction_items stock_transaction_items_stock_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transaction_items
    ADD CONSTRAINT stock_transaction_items_stock_transaction_id_fkey FOREIGN KEY (stock_transaction_id) REFERENCES public.stock_transactions(stock_transaction_id) ON DELETE CASCADE;


--
-- Name: stock_transactions stock_transactions_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(branch_id);


--
-- Name: stock_transactions stock_transactions_ref_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_ref_sales_invoice_id_fkey FOREIGN KEY (ref_sales_invoice_id) REFERENCES public.sales_invoices(sales_invoice_id);


--
-- Name: stock_transactions stock_transactions_transaction_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_transaction_type_id_fkey FOREIGN KEY (transaction_type_id) REFERENCES public.transaction_types(transaction_type_id);


--
-- Name: stock_transactions stock_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: supplier_payments supplier_payments_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(bank_account_id);


--
-- Name: supplier_payments supplier_payments_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(branch_id);


--
-- Name: supplier_payments supplier_payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(payment_method_id);


--
-- Name: supplier_payments supplier_payments_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id);


--
-- Name: supplier_payments supplier_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier_payments
    ADD CONSTRAINT supplier_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: suppliers suppliers_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id);


--
-- PostgreSQL database dump complete
--

\unrestrict xvOqkSiUqkgIbtBFD8zdYdHGUD7aN3K4V55FfXdSVtSLMsYf6arAO99C1Uvlm5D

