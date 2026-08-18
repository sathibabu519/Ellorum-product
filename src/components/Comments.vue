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
          :img-src="safeImageUrl(comment.thumbnailUrl)"
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
    safeImageUrl(url) {
      return typeof url === "string" && /^https?:\/\//i.test(url) ? url : null;
    },
    search_text() {
      const needle = String(this.search.text || "").toLowerCase();
      this.comments = this.comments_data.filter((product) =>
        String(product.name || "")
          .toLowerCase()
          .includes(needle)
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
        this.comments = comments.sort(function(a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      } else if (this.search.filter == "d") {
        this.comments = comments.sort(function(a, b) {
          if (a.name < b.name) {
            return 1;
          }
          if (a.name > b.name) {
            return -1;
          }
          return 0;
        });
      }
    },
    combined_data() {
      const comments_photos = this.comments.data.map((t1) => ({
        ...t1,
        ...this.photos_data.data.find((t2) => t2.id == t1.id),
      }));
      return comments_photos;
    },
  },
};
</script>