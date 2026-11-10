import streamlit as st

from config import APP_TITLE, APP_DESCRIPTION
from modules.data_loader import load_all_datasets


# ----------------------------------
# PAGE CONFIGURATION
# ----------------------------------

st.set_page_config(
    page_title=APP_TITLE,
    page_icon="🏛️",
    layout="wide"
)


# ----------------------------------
# APPLICATION HEADER
# ----------------------------------

st.title("🏛️ Government Service Co-Usage Discovery")

st.write(APP_DESCRIPTION)

st.divider()


# ----------------------------------
# LOAD DATASETS
# ----------------------------------

@st.cache_data
def get_datasets():
    return load_all_datasets()


try:

    datasets = get_datasets()

    journeys = datasets["journeys"]
    long_data = datasets["long_data"]
    basket = datasets["basket"]
    services = datasets["services"]

    st.success("All datasets loaded successfully!")

    # ----------------------------------
    # DATASET OVERVIEW
    # ----------------------------------

    st.subheader("📊 Dataset Overview")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Total Journeys",
        f"{len(journeys):,}"
    )

    col2.metric(
        "Total Services",
        len(services)
    )

    col3.metric(
        "Journey-Service Records",
        f"{len(long_data):,}"
    )

    col4.metric(
        "Average Services per Journey",
        round(journeys["Service_Count"].mean(), 2)
    )

    st.divider()

    # ----------------------------------
    # DATASET PREVIEW
    # ----------------------------------

    st.subheader("📁 Dataset Preview")

    selected_dataset = st.selectbox(
        "Select a dataset",
        [
            "Journeys",
            "Long Format",
            "Basket Matrix",
            "Service Catalogue"
        ]
    )

    dataset_mapping = {
        "Journeys": journeys,
        "Long Format": long_data,
        "Basket Matrix": basket,
        "Service Catalogue": services
    }

    st.dataframe(
        dataset_mapping[selected_dataset].head(10),
        use_container_width=True
    )

    st.caption(
        "Showing the first 10 records."
    )

except Exception as e:

    st.error(f"Application Error: {e}")