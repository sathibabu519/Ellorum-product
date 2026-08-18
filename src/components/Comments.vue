<template>
  <div class="home">
    <b-alert :show="!!errorMessage" variant="danger" class="load_error">
      {{ errorMessage }}
    </b-alert>
    <div class="header_search">
      <b-form-input
        class="header_searchInput"
        @input="search_text()"
        v-model="search.text"
        type="text"
        placeholder="Search by Name"
      ></b-form-input>
      <div class="sort_btn">
        <b-form-select
          @input="sort(search.text)"
          v-model="search.filter"
          :options="options"
        />
      </div>
    </div>
    <b-container class="home_row">
      <b-card-group deck v-for="comment in comments" :key="comment.id">
        <b-card
          :title="comment.name"
          :img-src="comment.thumbnailUrl"
          img-height="150"
          img-width="50"
          img-alt="Image"
          img-top
          tag="article"
          style="max-width: 20rem;"
          class="mb-5 mr-5 product"
        >
          <b-card-text>
            {{ comment.body }}
          </b-card-text>
        </b-card>
      </b-card-group>
    </b-container>
  </div>
</template>

<script>
import gql from "graphql-tag";
import {
  filterByField,
  mergeById,
  sortByField,
} from "../utils/collections";
import { logError } from "../utils/logger";
export default {
  name: "Comments",
  props: {},
  data() {
    return {
      comments: [],
      comments_data: [],
      photos_data: [],
      result: [],
      search: { filter: null, text: "" },
      errorMessage: "",
      options: [
        { value: null, text: "Sort By" },
        { value: "a", text: "Ascending" },
        { value: "d", text: "descending" },
      ],
    };
  },

  apollo: {
    comments: {
      query: gql`
        query($options: PageQueryOptions) {
          comments(options: $options) {
            data {
              id
              name
              body
            }
          }
          photos(options: $options) {
            data {
              id
              thumbnailUrl
            }
          }
        }
      `,
      variables: {
        options: {
          paginate: {
            page: 1,
            limit: 50,
          },
        },
      },
      manual: true,
      result({ data, error }) {
        if (error) {
          this.report_error(error);
          return;
        }
        if (!data || !data.comments || !data.photos) {
          this.report_error(
            new Error("Response did not contain comments and photos")
          );
          return;
        }
        try {
          this.photos_data = { ...data.photos };
          this.comments = { ...data.comments };
          this.comments = this.combined_data();
          this.comments_data = this.comments;
          this.errorMessage = "";
        } catch (mergeError) {
          this.report_error(mergeError);
        }
      },
      error(error) {
        this.report_error(error);
      },
    },
  },

  methods: {
    report_error(error) {
      this.comments = [];
      this.comments_data = [];
      this.errorMessage = `Unable to load products: ${error.message}`;
      logError("Failed to load products", error);
    },
    search_text() {
      this.comments = filterByField(
        this.comments_data,
        "name",
        this.search.text
      );
    },
    sort(searched_text) {
      if (searched_text) {
        this.input_text(this.comments);
      } else {
        this.input_text(this.comments_data);
      }
    },
    input_text(comments) {
      if (this.search.filter == "a") {
        this.comments = sortByField(comments, "name", "asc");
      } else if (this.search.filter == "d") {
        this.comments = sortByField(comments, "name", "desc");
      }
    },
    combined_data() {
      if (!Array.isArray(this.comments.data)) {
        throw new Error("Comments response did not contain a data list");
      }
      if (!Array.isArray(this.photos_data.data)) {
        throw new Error("Photos response did not contain a data list");
      }
      return mergeById(this.comments.data, this.photos_data.data);
    },
  },
};
</script>