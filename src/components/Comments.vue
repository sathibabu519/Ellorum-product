<template>
  <div class="home">
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
      result({ data }) {
        this.photos_data = { ...data.photos };
        this.comments = { ...data.comments };
        this.comments = this.combined_data();
        this.comments_data = this.comments;
      },
    },
  },

  methods: {
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
      return mergeById(this.comments.data, this.photos_data.data);
    },
  },
};
</script>