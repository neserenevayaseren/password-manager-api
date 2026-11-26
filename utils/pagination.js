function meta(q, total) {
    return { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) };
}

module.exports = { meta };