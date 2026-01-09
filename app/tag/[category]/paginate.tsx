"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ReactPaginate from "react-paginate";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const PaginateComponent = ({ totalCount }: { totalCount: number }) => {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const page = searchParams.get("page");


  const totalPages = Math.ceil(totalCount / 10);

  const [itemOffset, setItemOffset] = useState(0);



  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * 10) % totalCount;
    setItemOffset(newOffset);
    push(`/tag/${params["category"]}?page=${event.selected + 1}`);
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        <ReactPaginate
          previousLabel={<GrFormPrevious />}
          nextLabel={<GrFormNext />}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName="pagination"
          activeClassName="active"
        />
      </div>
    </>
  );
};

export default PaginateComponent;
